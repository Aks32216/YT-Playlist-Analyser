const puppeteer=require('puppeteer');
const fs=require('fs');
const path=require('path');
const pdf=require("pdfkit");

let cTab;

const listLink="https://www.youtube.com/playlist?list=PLSQl0a2vh4HC5feHa6Rc5c0wbRTx56nF7";

(async () => {
    try {
        const browserOpen = await puppeteer.launch({
          headless: false,
          defaultViewport: null,
          args:['--start-maximized'],
        });
      
        const pages = await browserOpen.pages();
        cTab = pages[0];
        await cTab.goto(listLink);
        await cTab.waitForSelector('h1#title');
        let name=await cTab.evaluate(function(select){return document.querySelector(select).innerText},'h1#title');
        let allData = await cTab.evaluate(getData,'div#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer');
        // console.log(name,allData.noOfViews,allData.noOfVideos);
        let totalVideo=allData.noOfVideos.split(" ")[0];
        console.log(totalVideo);
        let curVideos = await getCVideosLength(); 
        console.log(curVideos);
        while(totalVideo-curVideos>=2)
        {
          await scrollToBottom();
          curVideos= await getCVideosLength();
        }      

        let finalList=await getStats();
        let pdfDoc=new pdf;
        pdfDoc.pipe(fs.createWriteStream('Multidimensional-Calculus.pdf'));
        pdfDoc.text(JSON.stringify(finalList));
        pdfDoc.end();
        
        // let cPath=path.join(__dirname,name);
        // if (!fs.existsSync(cPath)){
        //   fs.mkdirSync(cPath);
        // }
        // let filePath=path.join(cPath,name+'.pdf');


    } catch (error) {
        console.log(error);
    }
  })();


  function getData(selector)
  {
      let allElemArray=document.querySelectorAll(selector);
      let noOfVideos=allElemArray[0].innerText;
      let noOfViews=allElemArray[1].innerText;
      return {
        noOfVideos,noOfViews
      }
  }

  async function getCVideosLength(){
    let length=await cTab.evaluate(getLength,'#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer');
    return length;
  }

  async function scrollToBottom(){
    await cTab.evaluate(goToBottom);
    function goToBottom(){
    window.scrollBy(0,window.innerHeight);
  }
  }

  function getLength(durationSelector){
      let durationArray=document.querySelectorAll(durationSelector);
      return durationArray.length;
  }

  async function getStats(){
    let list =cTab.evaluate(getNameAndDuration,'a#video-title','#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer')
    return list;
  }

  function getNameAndDuration(videoSelector,durationSelector){
    let videoElem=document.querySelectorAll(videoSelector);
    let durationElem=document.querySelectorAll(durationSelector);

    let curList=[];
    for(let i=0;i<videoElem.length;i++){
      let videoTitle=videoElem[i].innerText;
      let duration=durationElem[i].innerText;
      curList.push({videoTitle,duration});
    }
    return curList;

  }




