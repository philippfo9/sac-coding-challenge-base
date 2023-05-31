import nodeHtmlToImage from 'node-html-to-image';
import fs from 'fs';
import AWS from 'aws-sdk'
import axios from 'axios';
import { uploadImageToS3 } from './s3';

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_UPLOAD_KEY,
  secretAccessKey: process.env.S3_UPLOAD_SECRET,
})

export async function getLocalImage(path: string) {
  let image;
  if(fs.existsSync(path)) {
    image = fs.readFileSync(path);
  } else {
   throw new Error('Could not find file');
  }

  const base64Image = Buffer.from(image).toString('base64');

  return 'data:image/png;base64,' + base64Image
}

export async function downloadImage(path: string) {
  console.log('Downloading image from ', path)
  const imgResp = await axios.get(path, {responseType: 'arraybuffer'})
  console.log('Image downloaded from', path)
  return Buffer.from(imgResp.data);
}

export async function downloadImageToBase64(path: string) {
  return `data:image/png;base64,${(await downloadImage(path)).toString('base64')}`;
}


async function createRaffleHtml(name: string, ticketCount: number|undefined|null, image: string) {
  return  ` <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="initial-scale=1, width=device-width" />
    <title></title>
    <meta name="description" content="" />

    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Playfair Display:wght@900&display=swap"
    />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
    />

    <style>
      body {
        margin: 0;
        line-height: normal;
        width: 1200px;
        height: 675px;
      }
      .pattern-icon,
      .rectangle-div {
        position: absolute;
        top: 0;
        left: 0;
        width: 1200px;
        height: 675px;
      }
      .rectangle-div {
        border-radius: 56px;
        background-color: #fff;
        width: 1064px;
        height: 551px;
      }
      .vector-icon {
        position: relative;
        width: 23.87px;
        height: 23.87px;
        flex-shrink: 0;
      }
      .twitter-div,
      .twitter-div1 {
        display: flex;
        flex-direction: row;
        padding: 2.27368426322937px;
        box-sizing: border-box;
        align-items: flex-start;
        justify-content: flex-start;
      }
      .twitter-div {
        border-radius: 113.68px;
        width: 50.02px;
        height: 50.02px;
        flex-shrink: 0;
        padding: 11.36842155456543px;
        align-items: center;
        justify-content: center;
      }
      .vector-icon1 {
        position: relative;
        width: 25.01px;
        height: 18.76px;
        flex-shrink: 0;
      }
      .akar-iconsdiscord-fill-div {
        display: flex;
        flex-direction: column;
        padding: 2.27368426322937px;
        box-sizing: border-box;
        align-items: flex-start;
        justify-content: flex-start;
      }
      .discord-div,
      .social-links-div {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .discord-div {
        border-radius: 113.68px;
        background-color: rgba(255, 255, 255, 0.21);
        width: 50.02px;
        height: 50.02px;
        flex-shrink: 0;
        flex-direction: column;
        padding: 11.36842155456543px;
        box-sizing: border-box;
      }
      .social-links-div {
        position: absolute;
        top: 458px;
        left: 435px;
        backdrop-filter: blur(22.74px);
        width: 84px;
        height: 39px;
        flex-direction: row;
        gap: 7.96px;
      }
      .line-div {
        position: absolute;
        top: 466.5px;
        left: 293.5px;
        border-right: 1px solid #e9e9e9;
        box-sizing: border-box;
        width: 1px;
        height: 21px;
      }
      .monet-div {
        position: relative;
        font-weight: 900;
        display: inline-block;
      }
      .frame-div {
        position: absolute;
        top: 52px;
        left: 64px;
        border-radius: 100px;
        background-color: #fff;
        border: 1px solid #e9e9e9;
        box-sizing: border-box;
        width: 156px;
        height: 57px;
        display: flex;
        flex-direction: row;
        padding: 10px 40px;
        align-items: center;
        justify-content: center;
        color: #000;
        font-family: "Playfair Display";
      }
      .new-raffle-div {
        position: relative;
        font-weight: 600;
        display: inline-block;
        font-size: 20px;
      }
      .frame-div1 {
        position: absolute;
        top: 58px;
        left: 275px;
        border-radius: 100px;
        background-color: #e1ffeb;
        width: 194px;
        height: 46px;
        display: flex;
        flex-direction: row;
        padding: 10px 40px;
        box-sizing: border-box;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: #16b826;
      }
      .name {
        margin: 0;
        position: relative;
        font-weight: 800;
        display: inline-block;
        width: 602px;
      }
      .monet-span {
        color: #7b7b7b;
      }
      .live-on-monet {
        margin: 0;
        position: relative;
        font-size: 38px;
        display: inline-block;
        width: 714px;
        color: #bdbdbd;
      }
      .frame-div2 {
        position: absolute;
        top: 45%;
        transform: translateY(-50%);
        left: 64px;
        width: 602px;
        height: 143px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 16px;
        text-align: left;
        font-size: 58px;
        color: #232323;
      }
      .tablerclick-icon {
        position: relative;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        overflow: hidden;
      }
      .button-div {
        position: absolute;
        top: 456px;
        left: 64px;
        border-radius: 100px;
        background-color: #232323;
        width: 300px;
        height: 43px;
        display: flex;
        flex-direction: row;
        padding: 10px 40px;
        box-sizing: border-box;
        align-items: center;
        justify-content: center;
        gap: 10px;
        text-align: left;
        font-size: 16px;
      }
      .polygon-icon,
      .ticket-icon {
        position: absolute;
        top: 52px;
        left: 694.02px;
        width: 306px;
        height: 444px;
      }
      .polygon-icon {
        top: 65px;
        left: 702px;
        border-radius: 15px;
        width: 286px;
        height: 286px;
      }
      .available-tickets-div {
        position: absolute;
        top: 406px;
        left: 767px;
        font-size: 15.07px;
        display: inline-block;
        width: 130px;
        height: 14px;
      }
      .b,
      .content-div {
        position: absolute;
      }
      .b {
        top: 429px;
        left: 741px;
        font-size: 38px;
        display: inline-block;
        width: 184px;
        height: 45px;
      }
      .content-div {
        top: 62px;
        left: 68px;
        width: 1064px;
        height: 551px;
      }
      .twitter-post-div {
        position: relative;
        background-color: #fff;
        width: 100%;
        height: 675px;
        overflow: hidden;
        text-align: center;
        font-size: 32px;
        color: #fff;
        font-family: Inter;
      }
    </style>

  </head>
  <body>
    <div class="twitter-post-div">
      <img class="pattern-icon" alt="" src="${await getLocalImage('public/twitter-images/new-raffle/pattern.png')}"/>
      <div class="content-div">
        <div class="rectangle-div"></div>
        <div class="social-links-div">
          <div class="twitter-div">
            <div class="twitter-div1">
              <img class="vector-icon" alt="" src="${await getLocalImage('public/twitter-images/new-raffle/vector@1x.png')}" />
            </div>
          </div>
          <div class="discord-div">
            <div class="akar-iconsdiscord-fill-div">
              <img class="vector-icon1" alt="" src="${await getLocalImage('public/twitter-images/new-raffle/vector1@1x.png')}" />
            </div>
          </div>
        </div>
        <div class="line-div"></div>
        <div class="frame-div"><div class="monet-div">Monet</div></div>
        <div class="frame-div1">
          <div class="new-raffle-div">New Raffle</div>
        </div>
        <div class="frame-div2">
          <p class="name">${name}</p>
          <p class="live-on-monet">
            <span>Live on </span><span class="monet-span">MONET</span>
          </p>
        </div>
        <div class="button-div">
          <div class="new-raffle-div">monet.community</div>
        </div>
        <img 
          class="ticket-icon" 
          alt="" 
          src="${await getLocalImage('public/twitter-images/new-raffle/ticket@1x.png')}" 
        />
        <img
          class="polygon-icon"
          alt=""
          src="${await downloadImageToBase64(image)}"
        />
        <div class="available-tickets-div">Available Tickets</div>
        <b class="b">${ticketCount ?? 'Unlimited'}</b>
      </div>
    </div>

    <script></script>
  </body>
</html>
`
}

async function createWinnerHtml(name: string, image: string) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="initial-scale=1, width=device-width" />
  
      <title></title>
  
      <meta name="description" content="" />
      <link rel="stylesheet" href="./index.css" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair Display:wght@900&display=swap"
      />
      <style>
        body {
          margin: 0;
          line-height: normal;
          width: 1200px;
          height: 675px;
        }
        .div,
        .div1,
        .div2,
        .div3 {
          position: absolute;
          font-weight: 600;
          display: none;
        }
        .div {
          top: 589px;
          left: 243px;
          text-shadow: 0 0 0 rgba(255, 255, 255, 0.01);
        }
        .div1,
        .div2,
        .div3 {
          top: -12px;
          left: 352px;
        }
        .div2,
        .div3 {
          top: 334px;
          left: -36px;
        }
        .div3 {
          top: 585px;
          left: 185px;
          display: inline-block;
          text-shadow: 0 0 0 rgba(255, 255, 255, 0.01);
        }
        .div4,
        .div5,
        .div6,
        .div7,
        .div8,
        .div9 {
          position: absolute;
          top: -4px;
          left: 848px;
          font-weight: 600;
          display: none;
        }
        .div5,
        .div6,
        .div7,
        .div8,
        .div9 {
          top: 585px;
          left: 1031px;
          display: inline-block;
          text-shadow: 0 0 0 rgba(255, 255, 255, 0.01);
        }
        .div6,
        .div7,
        .div8,
        .div9 {
          top: 16px;
          left: 0;
        }
        .div7,
        .div8,
        .div9 {
          top: 236px;
          left: 1038px;
          display: none;
        }
        .div8,
        .div9 {
          top: 0;
          left: 527px;
          display: inline-block;
        }
        .div9 {
          top: 6px;
          left: 1071px;
        }
        .emojis-div,
        .rectangle-div {
          position: absolute;
          top: 14px;
          left: 36px;
          width: 1135px;
          height: 649px;
        }
        .rectangle-div {
          top: -10px;
          left: -10px;
          border-radius: 56px;
          background-color: #fff;
          border: 10px solid #232323;
          box-sizing: border-box;
          width: 1084px;
          height: 571px;
        }
        .vector-icon {
          position: relative;
          width: 23.88px;
          height: 23.88px;
          flex-shrink: 0;
          object-fit: cover;
        }
        .twitter-div,
        .twitter-div1 {
          display: flex;
          flex-direction: row;
          padding: 2.27368426322937px;
          box-sizing: border-box;
          align-items: flex-start;
          justify-content: flex-start;
        }
        .twitter-div {
          border-radius: 113.68px;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.01);
          width: 50.02px;
          height: 50.02px;
          flex-shrink: 0;
          padding: 11.36842155456543px;
          align-items: center;
          justify-content: center;
        }
        .vector-icon1 {
          position: relative;
          width: 25.01px;
          height: 18.76px;
          flex-shrink: 0;
          object-fit: cover;
        }
        .akar-iconsdiscord-fill-div {
          display: flex;
          flex-direction: column;
          padding: 2.27368426322937px;
          box-sizing: border-box;
          align-items: flex-start;
          justify-content: flex-start;
        }
        .discord-div,
        .social-links-div {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .discord-div {
          border-radius: 113.68px;
          background-color: rgba(255, 255, 255, 0.21);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.01);
          width: 50.02px;
          height: 50.02px;
          flex-shrink: 0;
          flex-direction: column;
          padding: 11.36842155456543px;
          box-sizing: border-box;
        }
        .social-links-div {
          position: absolute;
          top: 458px;
          left: 372px;
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.01);
          width: 84px;
          height: 39px;
          flex-direction: row;
          gap: 7.96px;
        }
        .monet-div {
          position: relative;
          font-weight: 900;
          display: inline-block;
          text-shadow: 0 0 0 rgba(255, 255, 255, 0.01);
        }
        .logo-div {
          position: absolute;
          top: 52px;
          left: 64px;
          border-radius: 100px;
          background-color: #fff;
          border: 1px solid #e9e9e9;
          box-sizing: border-box;
          width: 156px;
          height: 57px;
          display: flex;
          flex-direction: row;
          padding: 10px 40px;
          align-items: center;
          justify-content: center;
          font-family: "Playfair Display";
        }
        .just-won {
          position: relative;
          font-weight: 600;
          display: inline-block;
          text-shadow: 0 0 0 rgba(255, 255, 255, 0.01);
          width: 100%;
        }
        .just-won-div {
          position: absolute;
          top: 58px;
          left: 275px;
          border-radius: 100px;
          background-color: #eeffe1;
          width: 200px;
          height: 46px;
          display: flex;
          flex-direction: row;
          padding: 10px;
          box-sizing: border-box;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #159f22;
        }
        .stoned-ape-crew-123,
        .title-div {
          width: 500px;
          height: 170px;
          display: flex;
        }
        .stoned-ape-crew-123 {
          margin: 0;
          position: relative;
          font-weight: 800;
          align-items: center;
          flex-shrink: 0;
        }
        .title-div {
          position: absolute;
          top: 204px;
          left: 64px;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          white-space: normal;
          text-align: left;
          font-size: 54px;
          color: #232323;
        }
        .monetstonedapecrewcom-div {
          position: relative;
          font-weight: 600;
          display: inline-block;
        }
        .link-div {
          position: absolute;
          top: 456px;
          left: 64px;
          border-radius: 100px;
          background-color: #232323;
          width: 250px;
          height: 43px;
          display: flex;
          flex-direction: row;
          padding: 10px 40px;
          box-sizing: border-box;
          align-items: center;
          justify-content: center;
          text-align: left;
          font-size: 16px;
          color: #fff;
        }
        .nft-bg {
          position: absolute;
          top: 60px;
          left: 602px;
          width: 408px;
          height: 438px;
          background-color: #fff;
          border: 1px solid #E9E9E9;
          border-radius: 20px;
        }
        .nft-image-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 15px;
          width: 400px;
          height: 400px;
          object-fit: cover;
        }
        .content-div {
          position: absolute;
          top: 62px;
          left: 68px;
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.01);
          width: 1064px;
          height: 551px;
          font-size: 32px;
        }
        .twitter-post-win {
          position: relative;
          background-color: #fff;
          width: 100%;
          height: 675px;
          text-align: center;
          font-size: 64px;
          color: #000;
          font-family: Inter;
        }
      </style>

    </head>
    <body>
      <div class="twitter-post-win">
        <div class="emojis-div">
          <div class="div">😎</div>
          <div class="div1">💪</div>
          <div class="div2">🫡</div>
          <div class="div3">🤝</div>
          <div class="div4">🔥</div>
          <div class="div5">🚀</div>
          <div class="div6">🍀</div>
          <div class="div7">😍</div>
          <div class="div8">👏</div>
          <div class="div9">🎉</div>
        </div>
        <div class="content-div">
          <div class="rectangle-div"></div>
          <div class="social-links-div">
            <div class="twitter-div">
              <div class="twitter-div1">
                <img class="vector-icon" alt="" src="${await getLocalImage('public/twitter-images/won/vector@1x.png')}" />
              </div>
            </div>
            <div class="discord-div">
              <div class="akar-iconsdiscord-fill-div">
                <img class="vector-icon1" alt="" src="${await getLocalImage('public/twitter-images/won/vector1@1x.png')}" />
              </div>
            </div>
          </div>
          <div class="logo-div"><div class="monet-div">Monet</div></div>
          <div class="just-won-div"><div class="just-won">Just won! 🙌</div></div>
          <div class="title-div">
            <p class="stoned-ape-crew-123">${name}</p>
          </div>
          <div class="link-div">
            <div class="monetstonedapecrewcom-div">monet.community</div>
          </div>
          <div class="nft-bg">
            <img class="nft-image-icon" alt="" src="${await downloadImageToBase64(image)}" />
          </div>
        </div>
      </div>
  
      <script></script>
    </body>
  </html>
  `
}

async function createVerifiedCommunityHtml(communityName: string, logoImgUrl: string) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="initial-scale=1, width=device-width" />
  
      <title></title>
  
      <meta name="description" content="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair Display:wght@900&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
      />
  
      <style>
        body {
          margin: 0;
          line-height: normal;
          width: 1200px;
          height: 675px;
        }
        .pattern-icon {
          position: absolute;
          top: -13.72px;
          left: -4px;
          width: 1208px;
          height: 693.72px;
          object-fit: cover;
        }
        .rectangle-div {
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 56px;
          background-color: #fff;
          width: 1064px;
          height: 551px;
        }
        .vector-icon {
          position: relative;
          width: 23.88px;
          height: 23.88px;
          flex-shrink: 0;
          object-fit: cover;
        }
        .twitter-div,
        .twitter-div1 {
          display: flex;
          flex-direction: row;
          padding: 2.27368426322937px;
          box-sizing: border-box;
          align-items: flex-start;
          justify-content: flex-start;
        }
        .twitter-div {
          border-radius: 113.68px;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.01);
          width: 50.02px;
          height: 50.02px;
          flex-shrink: 0;
          padding: 11.36842155456543px;
          align-items: center;
          justify-content: center;
        }
        .vector-icon1 {
          position: relative;
          width: 25.01px;
          height: 18.76px;
          flex-shrink: 0;
          object-fit: cover;
        }
        .akar-iconsdiscord-fill-div {
          display: flex;
          flex-direction: column;
          padding: 2.27368426322937px;
          box-sizing: border-box;
          align-items: flex-start;
          justify-content: flex-start;
        }
        .discord-div,
        .social-links-div {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .discord-div {
          border-radius: 113.68px;
          background-color: rgba(255, 255, 255, 0.21);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.01);
          width: 50.02px;
          height: 50.02px;
          flex-shrink: 0;
          flex-direction: column;
          padding: 11.36842155456543px;
          box-sizing: border-box;
        }
        .social-links-div {
          position: absolute;
          top: 458px;
          left: 378px;
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.01);
          width: 84px;
          height: 39px;
          flex-direction: row;
          gap: 7.96px;
        }
        .monet-div {
          position: relative;
          font-weight: 900;
          display: inline-block;
          text-shadow: 0 0 0 rgba(255, 255, 255, 0.01);
        }
        .frame-div {
          position: absolute;
          top: 52px;
          left: 64px;
          border-radius: 100px;
          background-color: #fff;
          border: 1px solid #e9e9e9;
          box-sizing: border-box;
          width: 156px;
          height: 57px;
          display: flex;
          flex-direction: row;
          padding: 10px 40px;
          align-items: center;
          justify-content: center;
          font-family: "Playfair Display";
        }
        .verified-div {
          position: relative;
          font-weight: 600;
          display: inline-block;
          text-shadow: 0 0 0 rgba(255, 255, 255, 0.01);
        }
        .frame-div1 {
          position: absolute;
          top: 58px;
          left: 275px;
          border-radius: 100px;
          background-color: #e2f4ff;
          width: 194px;
          height: 46px;
          display: flex;
          flex-direction: row;
          padding: 10px 40px;
          box-sizing: border-box;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #038ee3;
        }
        .degenerate-ape-academy {
          margin: 0;
          position: relative;
          font-weight: 800;
          display: inline-block;
          width: 540px;
        }
        .monet-span {
          color: #7b7b7b;
        }
        .now-verified-on-monet {
          margin: 0;
          position: relative;
          font-size: 38px;
          display: inline-block;
          width: 602px;
          color: #bdbdbd;
        }
        .frame-div2 {
          position: absolute;
          top: 131px;
          left: 64px;
          width: 577px;
          height: 306px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 16px;
          text-align: left;
          font-size: 58px;
        }
        .monetstonedapecrewcom-div {
          position: relative;
          font-weight: 600;
          display: inline-block;
        }
        .button-div {
          position: absolute;
          top: 456px;
          left: 64px;
          border-radius: 100px;
          background-color: #232323;
          width: 250px;
          height: 43px;
          display: flex;
          flex-direction: row;
          padding: 10px 40px;
          box-sizing: border-box;
          align-items: center;
          justify-content: center;
          text-align: left;
          font-size: 16px;
          color: #fff;
        }
        .content-div,
        .logo-icon {
          position: absolute;
          top: 122px;
          left: 703px;
          width: 300px;
          height: 300px;
          border-radius: 50%;
        }
        .verified-icon {
          position: absolute;
          top: 95px;
          left: 900px;
        }
        .content-div {
          top: 62px;
          left: 68px;
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.01);
          width: 1064px;
          height: 551px;
        }
        .twitter-post-div {
          position: relative;
          background-color: #fff;
          width: 100%;
          height: 675px;
          text-align: center;
          font-size: 32px;
          color: #232323;
          font-family: Inter;
        }
  
      </style>
    </head>
    <body>
      <div class="twitter-post-div">
        <img class="pattern-icon" alt="" src="${await getLocalImage('public/twitter-images/verified/pattern@1x.png')}" />
        <div class="content-div">
          <div class="rectangle-div"></div>
          <div class="social-links-div">
            <div class="twitter-div">
              <div class="twitter-div1">
                <img class="vector-icon" alt="" src="${await getLocalImage('public/twitter-images/verified/vector@1x.png')}" />
              </div>
            </div>
            <div class="discord-div">
              <div class="akar-iconsdiscord-fill-div">
                <img class="vector-icon1" alt="" src="${await getLocalImage('public/twitter-images/verified/vector1@1x.png')}" />
              </div>
            </div>
          </div>
          <div class="frame-div"><div class="monet-div">Monet</div></div>
          <div class="frame-div1"><div class="verified-div">Verified</div></div>
          <div class="frame-div2">
            <p class="degenerate-ape-academy">${communityName}</p>
            <p class="now-verified-on-monet">
              <span>Now verified on </span><span class="monet-span">MONET </span>
            </p>
          </div>
          <div class="button-div">
            <div class="monetstonedapecrewcom-div">monet.community</div>
          </div>
          <img class="logo-icon" alt="" src="${await downloadImageToBase64(logoImgUrl)}" />
          <img class="verified-icon" alt="" src="${await getLocalImage('public/twitter-images/verified/verified.png')}" />
        </div>
      </div>
  
      <script></script>
    </body>
  </html>  
  `
}

async function createRaffleEndingSoonHtml(raffleName: string, maxTickets: number, ticketsSold: number, nftImage: string) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="initial-scale=1, width=device-width" />

      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair Display:wght@900&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
      />
      <style>
      body {
        margin: 0;
        line-height: normal;
        width: 1200px;
        height: 675px;
      }
      .content-child,
      .pattern-icon {
        position: absolute;
        top: 0;
        left: 0;
      }
      .pattern-icon {
        width: 1200px;
        height: 675px;
        object-fit: cover;
      }
      .content-child {
        border-radius: 56px;
        background-color: #fff;
        width: 1064px;
        height: 551px;
      }
      .vector-icon {
        position: relative;
        width: 23.88px;
        height: 23.87px;
        flex-shrink: 0;
        object-fit: cover;
      }
      .twitter,
      .twitter1 {
        display: flex;
        flex-direction: row;
      }
      .twitter1 {
        padding: 2.27368426322937px;
        align-items: flex-start;
        justify-content: flex-start;
      }
      .twitter {
        border-radius: 113.68px;
        width: 50.02px;
        height: 50.02px;
        flex-shrink: 0;
        padding: 11.36842155456543px;
        box-sizing: border-box;
        align-items: center;
        justify-content: center;
      }
      .vector-icon1 {
        position: relative;
        width: 25.01px;
        height: 18.76px;
        flex-shrink: 0;
        object-fit: cover;
      }
      .akar-iconsdiscord-fill {
        display: flex;
        flex-direction: column;
        padding: 2.27368426322937px;
        align-items: flex-start;
        justify-content: flex-start;
      }
      .discord,
      .social-links {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .discord {
        border-radius: 113.68px;
        background-color: rgba(255, 255, 255, 0.21);
        width: 50.02px;
        height: 50.02px;
        flex-shrink: 0;
        flex-direction: column;
        padding: 11.36842155456543px;
        box-sizing: border-box;
      }
      .social-links {
        position: absolute;
        top: 458px;
        left: 335px;
        backdrop-filter: blur(22.74px);
        width: 84px;
        height: 39px;
        flex-direction: row;
        gap: 7.96px;
      }
      .content-item {
        position: absolute;
        top: 466.5px;
        left: 293.5px;
        border-right: 1px solid #e9e9e9;
        box-sizing: border-box;
        width: 1px;
        height: 21px;
      }
      .monet {
        position: relative;
        font-weight: 900;
      }
      .monet-wrapper {
        position: absolute;
        top: 52px;
        left: 64px;
        border-radius: 100px;
        background-color: #fff;
        border: 1px solid #e9e9e9;
        box-sizing: border-box;
        width: 156px;
        height: 57px;
        display: flex;
        flex-direction: row;
        padding: 10px 40px;
        align-items: center;
        justify-content: center;
        color: #000;
        font-family: "Playfair Display";
      }
      .ending-soon {
        position: relative;
        font-weight: 600;
      }
      .ending-soon-wrapper {
        position: absolute;
        top: 58px;
        left: 275px;
        border-radius: 100px;
        background-color: #ffe8bb;
        height: 46px;
        display: flex;
        flex-direction: row;
        padding: 10px 40px;
        box-sizing: border-box;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: #ed6749;
      }
      .nft-name {
        margin: 0;
        position: relative;
        font-weight: 800;
        display: inline-block;
        /* width: 602px; */
        font-size: 58px;
        color: #232323;
      }
      .main-content {
        position: absolute;
        top: 50%;
        transform: translateY(-40%);
        left: 64px;
        width: 570px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        text-align: left;
      }
      .yoots-578-wrapper {
        position: absolute;
        top: 204px;
        left: 64px;
        width: 564px;
        height: 143px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        text-align: left;
        font-size: 58px;
        color: #232323;
      }
      .tablerclick-icon {
        position: relative;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        overflow: hidden;
      }
      .button {
        position: absolute;
        top: 456px;
        left: 64px;
        border-radius: 100px;
        background-color: #232323;
        width: 220px;
        height: 43px;
        display: flex;
        flex-direction: row;
        padding: 10px 40px;
        box-sizing: border-box;
        align-items: center;
        justify-content: center;
        gap: 10px;
        text-align: left;
        font-size: 16px;
      }
      .group-child,
      .ticket-icon {
        position: absolute;
        object-fit: cover;
      }
      .ticket-icon {
        top: 0;
        left: 0;
        width: 306px;
        height: 444px;
      }
      .group-child {
        top: 10px;
        left: 10px;
        border-radius: 15px;
        width: 286px;
        height: 286px;
        object-fit: cover;
      }
      .of-250,
      .tickets-left {
        position: absolute;
        display: inline-block;
      }
      .tickets-left {
        top: 360px;
        left: 0px;
        width: 306px;
        text-align: center;
        height: 14px;
      }
      .of-250 {
        top: 380px;
        left: 0px;
        font-size: 38px;
        width: 306px;
        height: 45px;
      }
      .ticket-parent {
        position: absolute;
        top: 52px;
        left: 690px;
        width: 306px;
        height: 444px;
        border-radius: 10px;
        font-size: 15.07px;
        padding: 0;
      }
      .monet1 {
        color: #7b7b7b;
      }
      .ending-soon-on-container {
        margin: 0;
        font-size: 38px;
        text-align: left;
        display: inline-block;
        color: #bdbdbd;
      }
      .content {
        position: absolute;
        top: 62px;
        left: 68px;
        width: 1064px;
        height: 551px;
      }
      .twitter-post {
        position: relative;
        background-color: #fff;
        width: 100%;
        height: 675px;
        overflow: hidden;
        text-align: center;
        font-size: 32px;
        color: #fff;
        font-family: Inter;
      }
      </style>
    </head>
    <body>
      <div class="twitter-post">
        <img class="pattern-icon" alt="" src="${await getLocalImage('public/twitter-images/ending/pattern@1x.png')}" />
        <div class="content">
          <div class="content-child"></div>
          <div class="social-links">
            <div class="twitter">
              <div class="twitter1">
                <img class="vector-icon" alt="" src="${await getLocalImage('public/twitter-images/ending/vector@1x.png')}" />
              </div>
            </div>
            <div class="discord">
              <div class="akar-iconsdiscord-fill">
                <img class="vector-icon1" alt="" src="${await getLocalImage('public/twitter-images/ending/vector1@1x.png')}" />
              </div>
            </div>
          </div>
          <div class="content-item"></div>
          <div class="monet-wrapper"><div class="monet">Monet</div></div>
          <div class="ending-soon-wrapper">
            <div class="ending-soon">Ending Soon 🔥</div>
          </div>
          <div class="main-content">
            <p class="nft-name">${raffleName}</p>
            <p class="ending-soon-on-container">
              <span>Ending soon on </span><span class="monet1">MONET </span>
            </p>
          </div>
          <div class="button">
            <img class="tablerclick-icon" alt="" src="${await getLocalImage('public/twitter-images/ending/tablerclick.png')}" />
            <div class="ending-soon">monet.community</div>
          </div>
          <div class="ticket-parent">
            <img class="ticket-icon" alt="" src="${await getLocalImage('public/twitter-images/ending/ticket@1x.png')}" />
            <img
              class="group-child"
              alt=""
              src="${await downloadImageToBase64(nftImage)}"
            />
            <div class="tickets-left">Tickets Left</div>
            <b class="of-250">${maxTickets ? maxTickets - ticketsSold : ''} ${maxTickets ? ' of ' + maxTickets : 'unlimited'}</b>
          </div>
        </div>
      </div>
    </body>
  </html>
  `
}


export async function createRaffleImage(name: string, ticketCount: number|undefined|null, image: string): Promise<Buffer> {
  console.log('Creating Raffle Image');

  const img = await nodeHtmlToImage({
    type: 'jpeg',
    html: await createRaffleHtml(name, ticketCount, image),
  })

  console.log('image created successfully', img)
  return img as Buffer
}

export async function createWinnerImage(name: string, image: string): Promise<Buffer> {
  console.log('Creating Winner Image');

  const img = await nodeHtmlToImage({
    type: 'jpeg',
    html: await createWinnerHtml(name, image),
  })

  console.log('image created successfully', img)
  return img as Buffer
}

export async function createVerifiedCommunityImage(communityName: string, logoImgUrl: string): Promise<Buffer> {
  console.log('Creating Verified Community Image');

  const img = await nodeHtmlToImage({
    type: 'jpeg',
    html: await createVerifiedCommunityHtml(communityName, logoImgUrl),
  })

  console.log('image created successfully', img)
  return img as Buffer
}

export async function createAndUploadWinnerImageS3(name: string, image: string): Promise<string> {
  const img = await createWinnerImage(name, image);
  
  const uploaded = await uploadImageToS3(img, 'png')

  console.log(uploaded)
  return uploaded
}

export async function createRaffleEndingSoonImage(raffleName: string, maxTickets: number, ticketsSold: number, nftImage: string): Promise<Buffer> {
  console.log('Creating Raffle Ending Soon Image');

  const img = await nodeHtmlToImage({
    type: 'jpeg',
    html: await createRaffleEndingSoonHtml(raffleName, maxTickets, ticketsSold, nftImage),
  })

  console.log('image created successfully', img)
  return img as Buffer
}