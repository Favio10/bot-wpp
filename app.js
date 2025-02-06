const fs = require('fs')
const ora = require('ora')
const chalk = require('chalk')

const {Client} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');


const SESSION_FILE_PATH = './session.json';
let client;
let sessionData;

const withSession = () => {
    const spinner = ora(`Cargando ${chalk.yellow('Validando session con Whatsapp...')}`);
    sessionData = require(SESSION_FILE_PATH);
    spinner.start();
    client = new Client({
        session: sessionData
    })

    client.on('ready', () => {
        console.log('Cliente ready!');
        spinner.stop();
    })

    client.on('auth_failure', () => {
        spinner.stop();
        console.log('Error de autenticacion, vuelve a generar el QRCODE para luego volver a escanear');
    })
    
    client.initialize();
}


const withOutSession = () => {

    console.log("No existe session activa de wpp, verificar");
    client = new Client();
    client.on('qr', qr => {
        qrcode.generate(qr, {small: true});
    });

    client.on('authenticated', (session) => {
        sessionData = session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
            if(err) {
                console.log(err);
            }
        })
    });
    client.initialize();

}

(fs.existsSync(SESSION_FILE_PATH)) ? withSession() : withOutSession();