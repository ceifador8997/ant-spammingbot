require('dotenv').config();
const TgBot = require("node-telegram-bot-api");
const { recognize } = require("node-tesseract-ocr");
const { promisify } = require("util")
const fs = require("fs")
const bot = new TgBot(process.env.TOKEN,{polling: true});

//Configuração do tesseract
const config = {
	lang: "eng",
	oem: 1,
	psm: 3
};


//Função principal, aqui onde será tratado as imagens
const main = async(message)=>{

	const chatId = message.chat.id

	if(message.chat.type == "private") return bot.sendMessage(chatId,"Sou um bot que é funcional apenas em grupos!")

	try{

		const imgDown = await bot.downloadFile(message.photo[1].file_id,"temp")
		const img = await recognize(`./${imgDown}`, config);
		
		if(img.includes("Go to dropelon.io")){
			
			bot.kickChatMember(message.chat.id, message.from.id);
			bot.deleteMessage(message.chat.id,message.message_id);
			
			bot.sendMessage(
				message.chat.id,
				`💬 O usuário ${message.from.first_name} [${message.from.id}](tg://user?id=${message.from.id}) enviou SPAMMING\nPunição: ❌ Banimento`,
          {
            parse_mode: "MARKDOWN",
            reply_markup: {
              inline_keyboard: [
                [{ text: "✅ Desbanir", callback_data: `uban ${message.from.id}` }]
              ]
            }
          }
        )
			const rm = promisify(fs.rm)
			try{
				rm(`./${imgDown}`)
			}catch(err){

				console.log(err)
			
			}
		}else{
	
			console.log("Imagem passou pelo teste")
	
		}

	}catch(err){
	
		console.log(err)
	
	}
		
};

const call = async (message)=>{

  const isAdm = await bot.getChatAdministrators(message.message.chat.id);
  const found = isAdm.find(e => e.user.id == message.from.id);
	const userId = message.data.split(' ')[1];
	
	if(found != undefined) {
    try{
      bot.unbanChatMember(message.message.chat.id,userId)
      
      bot.editMessageText(
        `💬 O usuário [${userId}](tg://user?id=${userId}) Foi desbanido ✅ `,
        {
          chat_id: message.message.chat.id,
          message_id: message.message.message_id,
          parse_mode: "MARKDOWN"
        }
      )
      bot.answerCallbackQuery(message.id,{
        text: "Usuário desbanido com sucesso!"
      })

    }catch(err){
      bot.sendMessage(
				message.message.chat.id, `Ocorreu um erro ao desbanir o usuário de ID [${userId}](tg://user?id=${userId})`,
				{parse_mode: "MARKDWON"})
    }
  
  }else{
    bot.answerCallbackQuery(message.id,{
      text: "Você não tem permissão para isto!"
    })

  }

};

const start = (message)=>{
  try{
  
    bot.sendMessage(message.chat.id, `Olá ${message.from.first_name} , eu sou um bot feito para banir usuários que enviarem spam do Elon Musk em seu grupo\n\nBasta me adicionar em seu grupo como administrador para que eu possa lhe ajudar :)`,{
      reply_to_message_id: message.message_id,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Criador",
              url: "https://t.me/"+process.env.USERNAME
            }
          ]
        ]
      }
		})
		
  }catch(err){
   console.log(err) 
  }
};


// Iniciando a chamadas dos métodos
bot.onText(/\/start/,start);

bot.on("photo",main);

bot.on('callback_query',call);

bot.onText(/\/source/,msg => bot.sendMessage(
	msg.chat.id,`Source do bot -> https://github.com/Lewizh11/ant-spammingbot/`),{parse_mode: "MARKDOWN"}
);

//tratamento de erros
bot.on('polling_error', (error) => console.log(error));

console.log("\033cBot ativo!\nPressione CTRL+C para parar o bot!")