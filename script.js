var request = require('request');
var cheerio = require('cheerio');
var iconv 	  = require('iconv-lite');
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

var dominio = "http://www.google.com.br" ;

app.use(require('express-promise')());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8081;       
var router = express.Router();              

router.get('/', function(req, res) {
	var cidade = req.query.cidade;

	res.json({resultado:getHorarios(cidade)});   
});

app.use('/api', router);

// STARTA O SERVIDOR
// =============================================================================
app.listen(port);
console.log('API REST INICIADA NA PORTA: ' + port);

//getHorarios("suzano");



function getHorarios(_cidade){
	var TIMEOUT_CONST = 20 * 1000;
	var arrayEstrutura;
	var arrayFilmes;
	var filme;
	var arrayRetorno = new Array();
	var retorno = new Object();
	var estrutura = new Object();
	var contadorRetorno=0;
	 var enderecoMap = new Object(); // or var map = {};
	
	function getEndereco(k) {
	    return enderecoMap[k];
	}


	return new Promise(function (resolve, reject) {
		request({url: dominio+'/search?q=filmes+em+cartaz+'+_cidade+'&oq=filmes+em+cartaz+'+_cidade+'&aqs=chrome..69i57.287j0j9&sourceid=chrome', encoding: null }, function (error, response, html) {
			//if (!error && response.statusCode == 200) {
				html = iconv.decode(html, 'ISO-8859-1');
				var $ = cheerio.load(html);
				arrayFilmes = new Array();
				//console.log($("#search a")[0]);
					//var teste = $("#search a")[0].parent();
			     	$("#search div ol div div div a").each(function(index,element){
			     		if($(this).text().toString().toLowerCase().indexOf("em cache") == -1 &&
			     			$(this).text().toString().toLowerCase().indexOf("similares") == -1 &&
			     			$(this).attr('href').toString().indexOf("/search?") > -1){
				     		var filmeLink = new Object();
				     	    filmeLink.titulo = $(this).text();
				     	    filmeLink.endereco = $(this).attr('href');
				     		arrayFilmes.push(filmeLink);
			     		}
			     	});

			     	//console.log(JSON.stringify(arrayFilmes))

			     arrayFilmes.forEach(function(arrayFilmesElement,arrayFilmesElementIndex){
				//$('a').each(function(i, element){
			     //PESQUISA O FILME

			     //if($(this).text().toString().trim().toLowerCase().indexOf(_filme) != -1){
			     	//caso tenha encontrado, faça o seguinte:
		     		//filme = arrayFilmesElement;

			     	//var cinemasHTML = $(this).attr('href');
			     	//request({url: dominio+cinemasHTML, encoding: null }, function (error, response, html) {


					//console.log(cinemasHTML);

				
					//console.log("requisicaooooooooooo");
					//console.log(horariorequisition);



                   	request({url: dominio+arrayFilmesElement.endereco, encoding: null }, function (error, response, html) {
			     		//if (!error && response.statusCode == 200) {
			     			html = iconv.decode(html, 'ISO-8859-1');
		     		 		var $ = cheerio.load(html);
			     			var exibirDadosFilme = false;
			     			var LINHAS_DE_CONTEUDO = 9;
							var linhas=0;
						   	var parar = false;


					     	$('div').each(function(index,element){


					     		if($(this).text().toString().indexOf(arrayFilmesElement.titulo) == 0 && $(this).text().toString().length == arrayFilmesElement.titulo.length) {
					     			exibirDadosFilme = true;
					     			filme = new Object();
					     		}

					     		if(exibirDadosFilme && !parar){
					     			switch(linhas){
					     				case 0: filme.titulo = $(this).text(); break;
					     				case 1: filme.ano = $(this).text(); break;
					     				case 2: filme.descricao = $(this).text(); break;
					     				//descricao esta duplicado na linha 3, ignorar
					     				//case 3: filme.titulo = $(this).text(); break;

					     				//linha 4 é linha em branco, ignorar
					     				//case 4:
					     				case 5: filme.lancamento = $(this).text(); break;
					     				case 6: filme.direcao = $(this).text(); break;
					     				case 7: filme.duracao = $(this).text(); break;
					     				case 8: filme.musica = $(this).text(); break;
					     				case 9: filme.generos = $(this).text(); break;
					     			}


					     			linhas++;
					     			if(linhas > LINHAS_DE_CONTEUDO){
					     				parar = true;
					     			}
					     		}
					     	});

							//console.log(JSON.stringify(filme));


						   	//console.log(html);
						   	var exibir = false;
						   	var LINHAS_APOS = 0;
						   	var linhas=0;
						   	var parar = false;

						   	var horariosDesestruturados = [];

						   	$('tbody tr td div').each(function(i,element){
							//console.log($(this).text());	
							if(!exibir){
								exibir = ($(this).text().toString().toLowerCase().indexOf("amanh") > -1 && $(this).text().toString().toLowerCase().indexOf("hoje") ==-1);
							}
							else{
								linhas++;	
								if(!parar){
									parar = ($(this).text().toString().toLowerCase().indexOf("todos") > -1);
								}
							}

							//console.log($(this).text());	

							if((linhas > LINHAS_APOS)  && !parar){

								horariosDesestruturados.push($(this).text());
						
							}
						});

						//console.log(horariosDesestruturados);


						arrayEstrutura = new Array();
						

						estrutura = new Object();
						estrutura.exibicoes = new Array();

						var horarioEstruturado = new Object();

						var cont=0;

						horariosDesestruturados.forEach(function(element){
							//console.log(element);
							
							if(cont==0){
								//console.log("passou 1");
								estrutura.cinema = new Object();
								estrutura.cinema.nome = element;

								//console.log(JSON.stringify(estrutura));
								

								//tentativa frustada de pegar o endereco....
								/*

								if(getEndereco(estrutura.cinema.nome) == undefined){	
									enderecoMap[estrutura.cinema.nome] = promiseEndereco(estrutura);	

								}else{
									estrutura.cinema.endereco = enderecoMap[estrutura.cinema.nome];
								}

								console.log(enderecoMap[estrutura.cinema.nome]);
								*/


							}
							else if(element.indexOf("Padr") > -1 || element.indexOf("3D") > -1 || element.indexOf("4D") > -1){
								//console.log("passou 2");
								horarioEstruturado = new Object();
								horarioEstruturado.tipo = element;
							}
							else if(element.length == 5){
								//console.log("passou 3");
								horarioEstruturado.horario = element;

								estrutura.exibicoes.push(horarioEstruturado);
							}
							else if(element == ''){
								//console.log("passou 4");
								estrutura.exibicoes = estrutura.exibicoes.filter( function( item, index, inputArray ) {
									return inputArray.indexOf(item) == index;
								});


								arrayEstrutura.push(estrutura);

								estrutura = new Object();
								estrutura.exibicoes = new Array();



								cont=-1;

							}
							cont++;
						});
							retorno = new Object();
							retorno.filme = filme;
							retorno.filme.horarios = arrayEstrutura;

							arrayRetorno.push(retorno);


							contadorRetorno++;

							//console.log(contadorRetorno);

							if(contadorRetorno >= arrayFilmes.length){
								//console.log(JSON.stringify(arrayRetorno));
								resolve(arrayRetorno);
							}
							//resolve(retorno);
							
						//}
					});



				//}//fim do if($(this).text().toString().trim().toLowerCase().indexOf(_filme) != -1){
     			//console.log("/--------------FIM----------------/");
			 }); //fim di $('a').each(function(i, element){



				//console.log(JSON.stringify(arrayRetorno));
				//resolve(arrayRetorno);

			//} //FIM DO IF DO REQUEST INICIAL
		}); //FIM DO REQUEST INICIAL

	}); //FIM DO PROMISE

	//return	JSON.stringify(arrayEstrutura);
	var TIMEOUT_CONST = null;
	var arrayEstrutura = null;
	var arrayFilmes = null;
	var filme = null;
	var arrayRetorno  = null;
	var retorno = null;
	var estrutura  = null;
	var contadorRetorno = null;
	var enderecoMap  = null;
	return;
} //FIM DA FUNCAO



function promiseEndereco(estrutura){
	return new Promise(function (resolve, reject) {
		request({url: dominio+'/search?q='+estrutura.cinema.nome+'&btnG=Pesquisar&rlz=1C1RAEH_pt-BRBR723BR724&gbv=1', encoding: null }, function (error, response, html) {
			html = iconv.decode(html, 'ISO-8859-1');
					var $ = cheerio.load(html);
					var exibir = false;
					var parar = false;	
					var LINHAS_DE_ENDERECO = 1;
					var contadorEndereco = 0;


					$("td ol div div div div span").each(function(index,element){
						if($(this).text().toString().toLowerCase().indexOf("endere") > -1){
							exibir = true;
						}

						//if(contadorEndereco > LINHAS_DE_ENDERECO){
						//	parar = true;
						//}	

						if(exibir && !parar){
							switch(contadorEndereco){
								case 1:
		 						 resolve($(this).text());
		 						 //estrutura.cinema.endereco = $(this).text();

		 						 //console.log($(this).text());
		 						 parar = true;
								 return;
								 break;
							}	
						contadorEndereco++;

							
						}
						
					
					});
		});
	});
}