const http = require("node:http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const parse = require("node-html-parser").parse;
const qs = require("querystring");

//lấy đường dẫn
const appendPath = path.join(__dirname, "txt", "append.txt");
const inputPath = path.join(__dirname, "txt", "input.txt");
const finalPath = path.join(__dirname, "txt", "final.txt");
const dataPath = path.join(__dirname, "dev-data", "data.json");
const overviewPath = path.join(__dirname, "templates", "overview.html");
const productPath = path.join(__dirname, "templates", "product.html");
const cardTemplate = path.join(__dirname, "templates", "card_template.html");
const searchPath = path.join(__dirname, "templates", "search.html");
const createPath = path.join(__dirname, "templates", "create.html");
const backupPath = path.join(__dirname, "dev-data", "data-backup.json");
let resultOne = "";
let resultTwo = "";
const myServer = http.createServer((request, response) => {
  response.statusCode = 200;
  response.setHeader("Content-Type", "text/html");
  const { pathname, query } = url.parse(request.url, true);
  let id = pathname.slice(9);
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
    //đọc thằng cha
    fs.readFile(overviewPath, "utf8", (err, dataOverview) => {
      //đưa thằng cha về dạng html
      const rootOverView = parse(dataOverview);
      //truy vấn ra thằng cha để chứa các cars product
      const divCard = rootOverView.querySelector(".cards-container");
      //đọc thằng card product
      fs.readFile(cardTemplate, "utf8", (err, dataCard) => {
        //đưa thằng product về dạng html
        const root = parse(dataCard);
        //truy vấn thằng figure ra
        const figure = root.querySelector("figure");

        //đọc thằng file Json
        fs.readFile(dataPath, (err, dataJson) => {
          //đưa data về dạng object
          const dataConvert = JSON.parse(dataJson);
          //xử lý về việc thay thế những thằng {{product}} ... bằng giá trị thật
          const dataFinal = dataConvert.map((product) => {
            return figure
              .toString()
              .replace(/{{(\w+)}}/g, (names, attribute) => {
                return product[attribute] || "";
              })
              .replace("#", `http://localhost:8080/product/${product.id}`);
          });
          //xử lý việc tính đưa thằng figgure vào bên trong thằng cha div
          dataFinal.map((figure) => {
            const tagFigure = parse(figure);
            divCard.appendChild(tagFigure);
          });
          //cuối cùng mình phải trả về
          response.end(rootOverView.toString());
        });
      });
    });
  } else if (pathname == `/product/${id}`) {
    fs.readFile(productPath, "utf8", (err, data) => {
      const rootProduct = parse(data);
      fs.readFile(dataPath, (errData, dataJson) => {
        const dataConvert = JSON.parse(dataJson);
        //tim id tuong ung
        const resultData = dataConvert.find((product) => +product.id == +id);
        console.log(rootProduct.toString());
        return response.end(
          rootProduct.toString().replace(/{{(\w+)}}/g, (names, attr) => {
            return resultData[attr] || [];
          })
        );
      });
    });
  } else if (request.url.startsWith("/search?") && request.method == "GET") {
    fs.readFile(dataPath, (err, dataJson) => {
      const convertData = JSON.parse(dataJson);
      const finalProduct = convertData.find((product) =>
        product.productName.toLowerCase().includes(query.q.toLowerCase())
      );
      if (finalProduct) {
        //do something
        response.statusCode = 302; //dieu huong
        response.setHeader("Location", `/product/${finalProduct.id}`);
        response.end();
      } else {
        fs.readFile(searchPath, (err, dataSearch) => {
          const rootSearch = parse(dataSearch);
          const h1 = rootSearch.querySelector("h1");
          h1.innerHTML = "🥦 Not Found 🌽";
          response.statusCode = 404;
          response.setHeader("Content-Type", "text/html");
          return response.end(rootSearch.toString());
        });
      }
    });
  } else if (pathname == "/search") {
    fs.readFile(searchPath, (err, data) => {
      // if(err) {} hoc vien tu check loi
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html");
      response.end(data);
    });
  } else if (pathname == "/create" && request.method == "POST") {
    // console.log("url  khi post", url.parse(request.url));
    let body = "";
    request.on("data", (chunk) => {
      return (body += chunk.toString());
    });
    console.log(body);
    request.on("end", () => {
      const parseBody = qs.parse(body);
      fs.readFile(dataPath, (err, dataJson) => {
        const convertData = JSON.parse(dataJson);
        const newData = {
          id: convertData[convertData.length - 1].id + 1,
          ...parseBody,
        };
        console.log("newData", newData);
        //check xem co ton tai hay khong
        let findIndexData = convertData.findIndex(
          (product) => product.id == newData.id
        );
        console.log("id", findIndexData);

        if (findIndexData == -1 && newData.productName) {
          convertData.push(newData);
        }

        fs.writeFile(
          backupPath,
          JSON.stringify(convertData),
          (err, dataWrite) => {
            if (err) {
              response.statusCode = 500;
              response.setHeader("Content-Type", "text/plain; charset=utf-8");
              response.end("Lỗi rồi");
            }
          }
        );
        response.statusCode = 200;
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify(convertData));
      });
    });
  } else if (pathname == "/create") {
    fs.readFile(createPath, (err, dataCreate) => {
      // if (err) {}
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html");
      response.end(dataCreate);
    });
  }
});

const port = 8080;
const local = "localhost";

myServer.listen(port, local, () => {
  console.log(`server is running in http://${local}:${port}`);
});
