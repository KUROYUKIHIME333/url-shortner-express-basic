import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import qr from "qr-image";
import axios from "axios";

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("styles"));

//GET ROUTE, TO RETURN index.ejs WHEN A CONNEXION OCCURED
app.get("/", (req: Request, res: Response) => {
    res.render("index");
});

//POST ROUTE, TO GET url FROM THE BODY OF THE REQUEST
app.post("/generate", async (req: Request, res: Response) => {
    const url: string = req.body.url;
    let shortUrl: string;
    
// SHORTEN URL WITH AN OPEN SOURCE API
    try {
        const response = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
        shortUrl = response.data;
    } 
    catch (error) {
        console.error("This error has occured when shortening your URL:", error);
        shortUrl = "An error has occured when shortening your URL";
    }
// QR CODE GENERATION
    const qrCode = qr.image(shortUrl, { type: "png" });
//ENCODE THE PNG QR CODE IN A TEXT FORMAT (BASE 64)
    const qrCodeData: string = await new Promise((resolve, reject) => {
        let data: Buffer[] = [];
        qrCode.on("data", chunk => data.push(chunk));
        qrCode.on("end", () => resolve(Buffer.concat(data).toString("base64")));
        qrCode.on("error", err => reject(err));
    });

//RETURN result.ejs WITH THE VALUES NEEDED WHEN SPECIFIED (in result.ejs, of course)
    res.render("result", { 
		qrCode: qrCodeData, 
		shortUrl: shortUrl 
	});
});

app.listen(PORT, () => {
    console.log(`The server runs on http://localhost:${PORT}`);
});