const requestPromise = require('request-promise')
const cheerio = require('cheerio')
const fs = require('fs');
const json2csvParser = require('json2csv').Parser;
const request = require('request')

const URL = [
   {
     url: 'https://www.imdb.com/title/tt6723592/?ref_=hm_fanfav_tt_2_pd_fp1',
      id:'tenet'
   }
     ,
   {
      url:  'https://www.imdb.com/title/tt0816692/?ref_=tt_sims_tti',
      id:'intersteller'
   }

];

(async ()=>{

   const moviesData=[];

   for(let movie of URL) {

      const response = await requestPromise({
         url: movie.url,

         //if content-Encoding:gzip
         headers: {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'cache-control': 'no-cache',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'

         }
         //gzip:true
      });

      const $ = cheerio.load(response);

      let title = $('div[class="title_wrapper"] > h1').text().trim();

      let rating = $('span[itemprop="ratingValue"]').text();

      let image = $('div[class="poster"] >a >img').attr('src');

      let peopleLike = $('div[class="imdbRating"] >a >span').text();

      let genres = [];
      $('div[class="title_wrapper"] a[href^="/search/"]').each((i, elm) => {
         let genre = $(elm).text();
         genres.push(genre)

      });

      moviesData.push({
         title,
         rating,
         image,
         peopleLike,
         genres
      })

      let file = fs.createWriteStream(`${movie.id}.jpg`)

      await new Promise((resolve,reject)=>{
         let straem = request({
            url:image,
            headers:{
               'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
               'accept-encoding': 'gzip, deflate, br',
               'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
               'cache-control': 'no-cache',
               'upgrade-insecure-requests': '1',
               'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'

            }
         }).pipe(file)
             .on('finish',()=>{
                console.log(`${movie.id} Fisnihed downloading images`)
                resolve();
             })
             .on('error',(error)=>{
                reject(error)
             })
      }).catch(error=>{
         console.log(error)
      })



   }

   // const fields = ['title','rating'];




   // const json2csvParserr = new json2csvParser();
   // const csv = json2csvParserr.parse(moviesData);
   //
   //
   // fs.writeFileSync('./data.csv',csv,'utf-8')
   //
   // console.log(csv)



})()