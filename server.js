const http = require("node:http");
const fs = require("fs");
const path = require("path");
const url = require("url");

//lấy đường dẫn
const appendPath = path.join(__dirname, "txt", "append.txt");
const inputPath = path.join(__dirname, "txt", "input.txt");
const finalPath = path.join(__dirname, "txt", "final.txt");
const dataPath = path.join(__dirname, "dev-data", "data.json");
const overviewPath = path.join(__dirname, "templates", "overview.html");
const productPath = path.join(__dirname, "templates", "product.html");
const cardTemplate = path.join(__dirname, "templates", "card_template.html");
let resultOne = "";
let resultTwo = "";
const myServer = http.createServer((request, response) => {
  response.statusCode = 200;
  response.setHeader("Content-Type", "text/html");
  const { pathname } = url.parse(request.url, true);
  let id = pathname.slice(5);
  // let id = pathname.split("/")[2];
  // let id = pathname.substring(5, pathname.length);
  // let id = "";
  // for (let i = 0; i < pathname.length; i++) {
  //   if (!isNaN(+pathname[i])) {
  //     id = id + pathname[i];
  //   }
  // }
  // console.log(id);
  // if (pathname == "/append") {
  //   //rút ra => bất đồng bộ là sử dụng callback, promise...
  //   //không đồng bộ mình gán vào biến
  //   fs.readFile(appendPath, "utf8", (err, data) => {
  //     if (err) {
  //       response.statusCode = 500;
  //       response.end("Loi Database roi");
  //     }

  //     response.end(data);
  //   });
  // }
  // if (pathname == "/merge") {
  //   fs.readFile(appendPath, "utf8", (err, data) => {
  //     if (err) {
  //       response.statusCode = 500;
  //       response.end("Loi Database roi");
  //     }
  //     resultOne = data;
  //   });
  //   fs.readFile(inputPath, "utf8", (err, data) => {
  //     if (err) {
  //       response.statusCode = 500;
  //       response.end("Loi Database roi");
  //     }
  //     resultTwo = data;
  //   });

  //   fs.writeFile(finalPath, resultTwo + resultOne, (err, data) => {
  //     if (err) {
  //       statusCode = 500;
  //       response.end("loi roi");
  //     }
  //   });
  //   response.end(resultTwo + resultOne);
  // }
  // if (pathname == "/") {
  //   response.end("<h1>Day HomePage</h1>");
  // } else if (pathname == "/overview") {
  //   response.end("Day la OverView");
  // } else if (pathname == "/product") {
  //   response.end("Day la trang product");
  // } else {
  //   response.end("KO tim thay");
  // }

  // if (pathname == `/api/${id}`) {
  //   fs.readFile(dataPath, (err, data) => {
  //     //bo check err
  //     const dataConvert = JSON.parse(data);
  //     const resultData = dataConvert.find(
  //       (product, index) => +product.id == +id
  //     );
  //     response.end(JSON.stringify(resultData));
  //   });
  // },

  if (pathname == "/" || pathname == "/overview") {
    //data tong
    //xử lý nội dung ở card
    fs.readFile(cardTemplate, "utf8", (err, dataCard) => {
      // console.log(dataCard);
      //data card
      fs.readFile(dataPath, (err, dataJson) => {
        //data json
        const dataConvert = JSON.parse(dataJson);
        //map
        const dataFinal = dataConvert.map((product) => {
          console.log(product);
          //names được hiểu tìm ra được những giống với đoạn data trong html {{image}}
          //prototype là lấy ra được những con => image
          //từ thằng card sẽ biến đổi nó
          ///{{(\w+)}}/g regex => lấy kí tự đặc biệt trong html
          //
          return dataCard.replace(/{{(\w+)}}/g, (names, prototype) => {
            console.log("names", names);
            console.log("prototype", prototype);
            return product[prototype] || "";
          });
        });
        console.log(dataFinal);
        response.end(dataFinal[0]);
      });
    });
  } else if (pathname == "/product") {
    fs.readFile(productPath, (err, data) => {
      response.end(data);
    });
  }
});

const port = 8080;
const local = "localhost";

myServer.listen(port, local, () => {
  console.log(`server is running in http://${local}:${port}`);
});
