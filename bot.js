const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const bot = new TelegramBot("5597036481:AAEbRcsyS7UcO16HFQKVH8NCSKIR98Tk95g", {
  polling: true,
});

const options = {
  method: "GET",
  url: "https://media-download-all-in-one.p.rapidapi.com/socialmediadownloader/",
  headers: {
    "X-RapidAPI-Key": "915623c965msh0e0766d40e62bddp1ed449jsn354f6c9eae13",
    "X-RapidAPI-Host": "media-download-all-in-one.p.rapidapi.com",
  },
};

async function downloadVideo(videoUrl) {
  options.params = { url: videoUrl };

  try {
    const response = await axios.request(options);

    let videoUrl;
    if (response.data.result.url) {
      // TikTokdan yuklab olsa
      videoUrl = response.data.result.url;
    } else if (response.data.result[0] && response.data.result[0].url) {
      // Instagramdan yuklab olsa
      videoUrl = response.data.result[0].url;
    } else {
      // Agar video URL topilmasa
      console.error("Video URL topilmadi");
      return null;
    }

    console.log(JSON.stringify(videoUrl) + " yuklandi");
    return videoUrl;
  } catch (error) {
    console.error("Request failed with status code:", error.response.status);
    console.error("Response data:", error.response.data);
    throw error; // Re-throw the error to let the calling function handle it
  }
}

bot.on("message", async (msg) => {
  console.log(msg);
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText === "/start") {
    bot.sendMessage(
      chatId,
      `Hayrli kun ${msg.from.first_name}👋, \nInstagram reels, stories va postlarni yuklab olmoqchiga o'xshaysiz, shunchaki linkni tashlang!`
    );
  }

  if (messageText !== "/start") {
    const loadingMessage = await bot.sendMessage(chatId, "⏳");

    try {
      const videoUrl = await downloadVideo(messageText);
      await bot.sendVideo(chatId, videoUrl);
      await bot.sendMessage(chatId, "So'rovingiz muvaffaqiyatli yuklandi ✅");

      // Delete the "Yuklanmoqda..." message after the video is uploaded
      await bot.deleteMessage(chatId, loadingMessage.message_id);
    } catch (error) {
      console.error("Request failed with status code:", error.response.status);
      console.error("Response data:", error.response.data);

      // Handle the error and inform the user
      await bot.sendMessage(
        chatId,
        "Tizim ishlashida xatolik yuz berdi, yoki link noto'g'ri. Keyinroq urinib ko'ring 🤕"
      );
    }
  }
});
