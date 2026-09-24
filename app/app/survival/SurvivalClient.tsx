"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Badge } from "@/components/ui";
import { useSoundAndTheme } from "@/components/SoundAndThemeContext";

interface DialogueStep {
  npcSpeaker: string;
  npcAvatar: string;
  npcJapanese: string;
  npcRomaji: string;
  npcMeaning: string;
  choices: Array<{
    textJa: string;
    textRomaji: string;
    textVi: string;
    politeness: "POLITE" | "CASUAL" | "RUDE";
    score: number;
    npcFeedback: string;
  }>;
}

interface ScenarioDef {
  id: string;
  slug: string;
  title: string;
  locationName: string;
  level: string;
  xpReward: number;
  bgGradient: string;
  description: string;
  steps: DialogueStep[];
}

const REAL_SCENARIOS: ScenarioDef[] = [
  {
    id: "sc-ramen",
    slug: "ordering-ramen",
    title: "Gọi Món Tại Tiệm Ramen Shibuya",
    locationName: "Quán Ramen Ichiran Shibuya, Tokyo",
    level: "N5 Thực Chiến",
    xpReward: 100,
    bgGradient: "from-amber-600 via-rose-700 to-sumi-950",
    description: "Bước vào một tiệm Ramen truyền thống náo nhiệt. Tự tin trả lời số lượng người, chọn độ cứng sợi mì và khen món ăn sau khi dùng bữa!",
    steps: [
      {
        npcSpeaker: "BÁC CHỦ TIỆM RAMEN",
        npcAvatar: "👨‍🍳",
        npcJapanese: "いらっしゃいませ！何名様ですか？",
        npcRomaji: "Irasshaimase! Nan-mei sama desu ka?",
        npcMeaning: "Kính chào quý khách! Quý khách đi mấy người ạ?",
        choices: [
          {
            textJa: "一人です。カウンター席でいいですか？",
            textRomaji: "Hitori desu. Kauntā-seki de ii desu ka?",
            textVi: "Dạ đi 1 người ạ. Ngồi ở quầy bar được không?",
            politeness: "POLITE",
            score: 100,
            npcFeedback: "Bác chủ quán gật đầu niềm nở mời bạn vào ghế quầy bar số 3!",
          },
          {
            textJa: "一人。",
            textRomaji: "Hitori.",
            textVi: "Một người. (Nói cộc lốc)",
            politeness: "CASUAL",
            score: 60,
            npcFeedback: "Bác chủ quán hơi ngạc nhiên nhưng vẫn chỉ tay: 'Mời bạn ngồi đây'.",
          },
          {
            textJa: "ラーメン二つ！",
            textRomaji: "Rāmen futatsu!",
            textVi: "Cho hai tô ramen! (Nhầm số người)",
            politeness: "RUDE",
            score: 40,
            npcFeedback: "Bác chủ quán cười: 'Ủa bạn đi mấy người mà gọi 2 tô liền vậy?'",
          },
        ],
      },
      {
        npcSpeaker: "BÁC CHỦ TIỆM RAMEN",
        npcAvatar: "👨‍🍳",
        npcJapanese: "どのラーメンにしますか？麺の硬さはどうしますか？",
        npcRomaji: "Dono rāmen ni shimasu ka? Men no katasa wa dō shimasu ka?",
        npcMeaning: "Quý khách dùng loại Ramen nào? Sợi mì muốn nấu độ cứng ra sao?",
        choices: [
          {
            textJa: "豚骨ラーメンをお願いします！麺は硬めで！",
            textRomaji: "Tonkotsu rāmen o onegaishimasu! Men wa katame de!",
            textVi: "Cho tôi một tô Tonkotsu Ramen! Sợi mì nấu hơi cứng chút ạ!",
            politeness: "POLITE",
            score: 100,
            npcFeedback: "Chuẩn phong cách người sành ăn mì Ramen Nhật Bản! Bác chủ quán hô to: 'Tonkotsu katame!'",
          },
          {
            textJa: "普通のラーメンでいいです。",
            textRomaji: "Futsū no rāmen de ii desu.",
            textVi: "Lấy tô bình thường là được rồi.",
            politeness: "CASUAL",
            score: 75,
            npcFeedback: "Bác chủ quán ghi đơn: 'Vâng, một tô Shoyu bình thường nhé'.",
          },
          {
            textJa: "何でもいい。",
            textRomaji: "Nandemo ii.",
            textVi: "Cái gì cũng được. (Bất lịch sự)",
            politeness: "RUDE",
            score: 30,
            npcFeedback: "Bác chủ quán gãi đầu lúng túng.",
          },
        ],
      },
      {
        npcSpeaker: "BÁC CHỦ TIỆM RAMEN",
        npcAvatar: "👨‍🍳",
        npcJapanese: "お待たせしました！豚骨ラーメン一丁！熱いので気をつけてね。",
        npcRomaji: "Omatase shimashita! Tonkotsu rāmen itchō! Atsui node ki o tsukete ne.",
        npcMeaning: "Xin để quý khách đợi lâu! Một tô Tonkotsu nóng hổi đây! Coi chừng nóng nhé.",
        choices: [
          {
            textJa: "いただきます！うわぁ、すごく美味しそうですね！",
            textRomaji: "Itadakimasu! Uwā, sugoku oishisō desu ne!",
            textVi: "Tôi xin phép dùng bữa! Oa, trông ngon mắt quá chừng!",
            politeness: "POLITE",
            score: 100,
            npcFeedback: "Bác chủ quán cười tươi rói tự hào về món mì của mình!",
          },
          {
            textJa: "ごちそうさまでした。とても美味しかったです！",
            textRomaji: "Gochisōsama deshita. Totemo oishikatta desu!",
            textVi: "Cảm ơn vì bữa ăn ngon miệng. Món mì rất ngon!",
            politeness: "POLITE",
            score: 100,
            npcFeedback: "Bác chủ quán cảm ơn bạn rối rít và chào tạm biệt nhiệt tình!",
          },
        ],
      },
    ],
  },
  {
    id: "sc-station",
    slug: "shinjuku-station",
    title: "Hỏi Đường Tại Đại Nhà Ga Shinjuku",
    locationName: "Ga Shinjuku Tuyến Yamanote, Tokyo",
    level: "N5 Thực Chiến",
    xpReward: 100,
    bgGradient: "from-blue-700 via-indigo-800 to-sumi-950",
    description: "Nhà ga đông đúc nhất hành tinh. Tìm đúng cổng soát vé và hỏi nhân viên nhà ga đường đến sân ga Yamanote số 14 một cách chuẩn chỉ!",
    steps: [
      {
        npcSpeaker: "NHÂN VIÊN NHÀ GA",
        npcAvatar: "👮‍♂️",
        npcJapanese: "はい、何かお困りですか？どちらへ行かれますか？",
        npcRomaji: "Hai, nanika okomari desu ka? Dochira e ikaremasu ka?",
        npcMeaning: "Dạ vâng, quý khách cần hỗ trợ gì không? Quý khách muốn đi đâu ạ?",
        choices: [
          {
            textJa: "すみません、山手線の渋谷方面は何番線ですか？",
            textRomaji: "Sumimasen, Yamanote-sen no Shibuya hōmen wa nan-bansen desu ka?",
            textVi: "Xin lỗi anh, tuyến Yamanote hướng đi Shibuya ở đường ray số mấy ạ?",
            politeness: "POLITE",
            score: 100,
            npcFeedback: "Nhân viên mỉm cười giơ tay hướng dẫn rành mạch: 'Dạ ở sân ga số 14 nhé bạn!'",
          },
          {
            textJa: "山手線、どこ？",
            textRomaji: "Yamanote-sen, doko?",
            textVi: "Yamanote, ở đâu? (Cộc lốc)",
            politeness: "CASUAL",
            score: 55,
            npcFeedback: "Nhân viên hơi sững sờ nhưng vẫn chỉ đường: 'À, ở bên kia bạn nhé'.",
          },
        ],
      },
      {
        npcSpeaker: "NHÂN VIÊN NHÀ GA",
        npcAvatar: "👮‍♂️",
        npcJapanese: "あちらの階段を上って、右側の14番線ですよ。Suicaはお持ちですか？",
        npcRomaji: "Achira no kaidan o agatte, migigawa no jū-yon bansen desu yo. Suica wa omochi desu ka?",
        npcMeaning: "Bạn đi lên cầu thang đằng kia, sân ga số 14 ở bên phải nhé. Bạn đã có thẻ IC Suica chưa?",
        choices: [
          {
            textJa: "はい、持っています。教えていただきありがとうございます！",
            textRomaji: "Hai, motte imasu. Oshiete itadaki arigatō gozaimasu!",
            textVi: "Dạ tôi có rồi. Cảm ơn anh rất nhiều vì đã tận tình chỉ dẫn!",
            politeness: "POLITE",
            score: 100,
            npcFeedback: "Nhân viên cúi chào thân thiện: 'Không có chi, chúc bạn chuyến đi tốt lành!'",
          },
          {
            textJa: "Suica？分かりません。切符はどこで買えますか？",
            textRomaji: "Suica? Wakarimasen. Kippu wa doko de kaemasu ka?",
            textVi: "Suica là gì tôi chưa rõ. Tôi có thể mua vé giấy ở đâu ạ?",
            politeness: "POLITE",
            score: 90,
            npcFeedback: "Nhân viên chỉ vào máy bán vé tự động: 'Ở dãy máy bán vé màu xanh kia nhé bạn!'",
          },
        ],
      },
    ],
  },
  {
    id: "sc-konbini",
    slug: "konbini-shopping",
    title: "Mua Sắm Tại Cửa Hàng Tiện Lợi (Konbini)",
    locationName: "Cửa hàng 7-Eleven Akihabara",
    level: "N5 Thực Chiến",
    xpReward: 100,
    bgGradient: "from-emerald-700 via-teal-800 to-sumi-950",
    description: "Thanh toán cơm hộp Bento, trà xanh Matcha và đối đáp lưu loát các câu hỏi thường gặp về hâm nóng thức ăn, túi đựng và biên lai!",
    steps: [
      {
        npcSpeaker: "THU NGÂN KONBINI",
        npcAvatar: "🏪",
        npcJapanese: "いらっしゃいませ！ポイントカードはお持ちですか？",
        npcRomaji: "Irasshaimase! Pointo kādo wa omochi desu ka?",
        npcMeaning: "Kính chào quý khách! Quý khách có mang theo thẻ tích điểm không ạ?",
        choices: [
          {
            textJa: "持っていません。大丈夫です。",
            textRomaji: "Motte imasen. Daijōbu desu.",
            textVi: "Dạ tôi không có. Cứ thanh toán bình thường đi ạ.",
            politeness: "POLITE",
            score: 100,
            npcFeedback: "Thu ngân nhanh nhẹn quét mã vạch sản phẩm 'Tít!'",
          },
          {
            textJa: "ない。",
            textRomaji: "Nai.",
            textVi: "Không có. (Khá cộc)",
            politeness: "CASUAL",
            score: 60,
            npcFeedback: "Thu ngân tiếp tục tính tiền.",
          },
        ],
      },
      {
        npcSpeaker: "THU NGÂN KONBINI",
        npcAvatar: "🏪",
        npcJapanese: "お弁当は温めますか？レジ袋はお付けしますか？",
        npcRomaji: "Obentō wa atatamemasu ka? Reji-bukuro wa otsuke shimasu ka?",
        npcMeaning: "Hộp cơm có cần quay nóng trong lò vi sóng không? Bạn có lấy túi nilông không?",
        choices: [
          {
            textJa: "温めをお願いします。袋も1枚ください。",
            textRomaji: "Atatame o onegaishimasu. Fukuro mo ichi-mai kudasai.",
            textVi: "Làm ơn hâm nóng giúp tôi. Cho tôi xin thêm 1 chiếc túi nữa ạ.",
            politeness: "POLITE",
            score: 100,
            npcFeedback: "Thu ngân cho cơm vào lò vi sóng 30 giây và xếp vào túi xách gọn gàng!",
          },
          {
            textJa: "そのままでいいです。袋は要りません。",
            textRomaji: "Sono mama de ii desu. Fukuro wa irimasen.",
            textVi: "Cứ để vậy được rồi. Tôi không cần túi đâu ạ.",
            politeness: "POLITE",
            score: 100,
            npcFeedback: "Thu ngân dán tem thanh toán trực tiếp lên hộp cơm: 'Dạ vâng!'",
          },
        ],
      },
      {
        npcSpeaker: "THU NGÂN KONBINI",
        npcAvatar: "🏪",
        npcJapanese: "ちょうど680円になります。レシートはどうされますか？",
        npcRomaji: "Chōdo roppyaku hachijū-en ni narimasu. Reshīto wa dō saremasu ka?",
        npcMeaning: "Tổng cộng vừa đúng 680 Yên. Hóa đơn biên lai bạn có lấy không ạ?",
        choices: [
          {
            textJa: "レシートは結構です。ありがとうございました！",
            textRomaji: "Reshīto wa kekkō desu. Arigatō gozaimashita!",
            textVi: "Dạ hóa đơn tôi không cần đâu. Cảm ơn bạn rất nhiều!",
            politeness: "POLITE",
            score: 100,
            npcFeedback: "Thu ngân cúi đầu cảm ơn: 'Arigatō gozaimashita! Xin hẹn gặp lại quý khách!'",
          },
          {
            textJa: "レシートもください。",
            textRomaji: "Reshīto mo kudasai.",
            textVi: "Cho tôi xin cả hóa đơn nhé.",
            politeness: "POLITE",
            score: 95,
            npcFeedback: "Thu ngân đưa tiền thừa và hóa đơn bằng cả hai tay trang trọng.",
          },
        ],
      },
    ],
  },
  {
    id: "sc-akiba",
    slug: "akihabara-anime",
    title: "Mua Sắm Anime & Miễn Thuế Tại Akihabara",
    locationName: "Cửa hàng Figure Akihabara, Tokyo",
    level: "N5 Thực Chiến",
    xpReward: 90,
    bgGradient: "from-purple-600 via-pink-700 to-sumi-950",
    description: "Khám phá phố điện tử Akihabara, hỏi nhân viên xem mô hình trong tủ kính và làm thủ tục miễn thuế Passport Tax-Free.",
    steps: [
      {
        npcSpeaker: "NHÂN VIÊN AKIHABARA",
        npcAvatar: "🤖",
        npcJapanese: "いらっしゃいませ！ショーケースの中の商品をご覧になりますか？",
        npcRomaji: "Irasshaimase! Shōkēsu no naka no shōhin o goran ni narimasu ka?",
        npcMeaning: "Kính chào quý khách! Quý khách có muốn xem sản phẩm bên trong tủ kính không ạ?",
        choices: [
          {
            textJa: "すみません、このフィギュアを見せていただけますか？",
            textRomaji: "Sumimasen, kono figyua o misete itadakemasu ka?",
            textVi: "Xin lỗi anh, làm ơn cho tôi xem mô hình này được không ạ?",
            politeness: "POLITE",
            score: 100,
            npcFeedback: "Nhân viên dùng chìa khóa cẩn thận mở tủ kính lấy mô hình ra cho bạn ngắm!",
          },
          {
            textJa: "これ見たい。",
            textRomaji: "Kore mitai.",
            textVi: "Tôi muốn xem cái này. (Cộc lốc)",
            politeness: "CASUAL",
            score: 65,
            npcFeedback: "Nhân viên hỗ trợ mở tủ nhưng có vẻ hơi ngập ngừng.",
          },
        ],
      },
      {
        npcSpeaker: "NHÂN VIÊN AKIHABARA",
        npcAvatar: "🤖",
        npcJapanese: "はい、どうぞ！こちらの大人気フィギュアですね。免税をご利用ですか？",
        npcRomaji: "Hai, dōzo! Kochira no daininki figyua desu ne. Menzei o goriyō desu ka?",
        npcMeaning: "Vâng, xin mời! Đây là mô hình đang rất hot đó. Quý khách có dùng dịch vụ miễn thuế Tax-Free không?",
        choices: [
          {
            textJa: "はい、パスポートを持っています。免税でお願いします！",
            textRomaji: "Hai, pasupōto o motte imasu. Menzei de onegaishimasu!",
            textVi: "Dạ có, tôi có mang hộ chiếu. Làm ơn tính giá miễn thuế giúp tôi ạ!",
            politeness: "POLITE",
            score: 100,
            npcFeedback: "Nhân viên kiểm tra visa và giảm ngay 10% thuế tiêu dùng cho bạn!",
          },
          {
            textJa: "免税って何ですか？",
            textRomaji: "Menzei tte nan desu ka?",
            textVi: "Miễn thuế là cái gì thế?",
            politeness: "CASUAL",
            score: 80,
            npcFeedback: "Nhân viên giải thích ngắn gọn về chính sách giảm thuế cho khách du lịch.",
          },
        ],
      },
    ],
  },
  {
    id: "sc-ryokan",
    slug: "hakone-ryokan",
    title: "Nhận Phòng Ryokan & Tắm Onsen Tại Hakone",
    locationName: "Lữ quán suối nước nóng Hakone Onsen",
    level: "N5 Thực Chiến",
    xpReward: 100,
    bgGradient: "from-teal-700 via-emerald-800 to-sumi-950",
    description: "Trải nghiệm văn hóa lữ quán truyền thống Nhật Bản, hỏi giờ dùng bữa tối Kaiseki và quy tắc tắm suối nước nóng Onsen.",
    steps: [
      {
        npcSpeaker: "NỮ TIẾP VIÊN OKAMI",
        npcAvatar: "👘",
        npcJapanese: "ようこそ箱根温泉へ！ご予約のお名前をお伺いできますか？",
        npcRomaji: "Yōkoso Hakone Onsen e! Goyoyaku no onamae o oukagai dekimasu ka?",
        npcMeaning: "Chào mừng quý khách đến với Suối nước nóng Hakone! Tôi xin phép được hỏi tên người đặt phòng ạ?",
        choices: [
          {
            textJa: "予約したグエンと申します。チェックインをお願いします。",
            textRomaji: "Yoyaku shita Guen to mōshimasu. Chekkuin o onegaishimasu.",
            textVi: "Tôi tên là Nguyễn đã đặt phòng trước. Làm ơn cho tôi làm thủ tục nhận phòng ạ.",
            politeness: "POLITE",
            score: 100,
            npcFeedback: "Nữ tiếp viên cúi đầu 90 độ cung kính mời bạn vào phòng trà thưởng thức bánh wagashi!",
          },
          {
            textJa: "チェックイン。",
            textRomaji: "Chekkuin.",
            textVi: "Nhận phòng. (Thiếu lịch sự)",
            politeness: "RUDE",
            score: 45,
            npcFeedback: "Nữ tiếp viên giật mình nhưng vẫn cố gắng tìm tên bạn trong danh sách.",
          },
        ],
      },
      {
        npcSpeaker: "NỮ TIẾP VIÊN OKAMI",
        npcAvatar: "👘",
        npcJapanese: "確認いたしました！夕食は18時から大広間でご用意いたします。温泉は24時間ご利用いただけますよ。",
        npcRomaji: "Kakunin itashimashita! Yūshoku wa jū-hachi-ji kara ōbiroma de goyōi itashimasu. Onsen wa nijū-yo-jikan goriyō itadakemasu yo.",
        npcMeaning: "Tôi đã kiểm tra rồi ạ! Bữa tối sẽ phục vụ từ 18 giờ tại sảnh lớn. Suối nước nóng mở cửa phục vụ 24/24 giờ nhé quý khách.",
        choices: [
          {
            textJa: "ありがとうございます！温泉に入るのがとても楽しみです。",
            textRomaji: "Arigatō gozaimasu! Onsen ni hairu no ga totemo tanoshimi desu.",
            textVi: "Cảm ơn cô rất nhiều! Tôi rất hào hứng được ngâm mình trong suối nước nóng.",
            politeness: "POLITE",
            score: 100,
            npcFeedback: "Nữ tiếp viên mỉm cười trao chìa khóa phòng và hướng dẫn mặc áo yukata!",
          },
        ],
      },
    ],
  },
  {
    id: "sc-pharmacy",
    slug: "japanese-pharmacy",
    title: "Mua Thuốc Cảm Sốt Tại Hiệu Thuốc Nhật",
    locationName: "Hiệu thuốc Matsumoto Kiyoshi, Tokyo",
    level: "N5 Thực Chiến",
    xpReward: 95,
    bgGradient: "from-cyan-700 via-blue-800 to-sumi-950",
    description: "Diễn tả triệu chứng đau đầu, sốt nhẹ khi đi du lịch và hỏi dược sĩ liều lượng uống mỗi ngày một cách an tâm.",
    steps: [
      {
        npcSpeaker: "DƯỢC SĨ HIỆU THUỐC",
        npcAvatar: "💊",
        npcJapanese: "どうされましたか？どのような症状ですか？",
        npcRomaji: "Dō saremashita ka? Dono yō na shōjō desu ka?",
        npcMeaning: "Bạn bị làm sao thế? Triệu chứng của bạn như thế nào?",
        choices: [
          {
            textJa: "昨日から頭が痛くて、少し熱があります。かぜ薬はありますか？",
            textRomaji: "Kinō kara atama ga itakute, sukoshi netsu ga arimasu. Kaze-gusuri wa arimasu ka?",
            textVi: "Từ hôm qua tôi bị đau đầu và có hơi sốt nhẹ. Ở đây có thuốc cảm không ạ?",
            politeness: "POLITE",
            score: 100,
            npcFeedback: "Dược sĩ gật đầu thấu hiểu và lấy ngay hộp thuốc cảm tổng hợp chuyên dụng!",
          },
          {
            textJa: "頭痛い。薬。",
            textRomaji: "Atama itai. Kusuri.",
            textVi: "Đau đầu. Thuốc. (Rất cộc lốc)",
            politeness: "RUDE",
            score: 50,
            npcFeedback: "Dược sĩ nhìn bạn bối rối trước khi tìm thuốc.",
          },
        ],
      },
      {
        npcSpeaker: "DƯỢC SĨ HIỆU THUỐC",
        npcAvatar: "💊",
        npcJapanese: "頭痛と熱ですね。この総合かぜ薬がよく効きますよ。1日3回、食後に飲んでください。",
        npcRomaji: "Zutsū to netsu desu ne. Kono sōgō kaze-gusuri ga yoku kikimasu yo. Ichi-nichi san-kai, shokugo ni nonde kudasai.",
        npcMeaning: "Đau đầu và sốt đúng không. Loại thuốc cảm này công hiệu lắm đó. Hãy uống mỗi ngày 3 lần sau bữa ăn nhé.",
        choices: [
          {
            textJa: "分かりました。食後ですね。ありがとうございます！",
            textRomaji: "Wakarimashita. Shokugo desu ne. Arigatō gozaimasu!",
            textVi: "Tôi hiểu rồi ạ. Uống sau bữa ăn đúng không. Cảm ơn dược sĩ nhiều!",
            politeness: "POLITE",
            score: 100,
            npcFeedback: "Dược sĩ ân cần dặn dò: 'Chúc bạn mau chóng khỏi bệnh và giữ ấm nhé!'",
          },
        ],
      },
    ],
  },
  {
    id: "sc-taxi",
    slug: "kyoto-taxi",
    title: "Đi Taxi Ngắm Cảnh Tại Cố Đô Kyoto",
    locationName: "Cửa Tây Ga Kyoto",
    level: "N5 Thực Chiến",
    xpReward: 90,
    bgGradient: "from-amber-700 via-orange-800 to-sumi-950",
    description: "Bắt taxi tại ga Kyoto để đến Chùa Vàng Kinkaku-ji, học cách nói điểm đến và hỏi cách thanh toán bằng thẻ IC Suica.",
    steps: [
      {
        npcSpeaker: "TÀI XẾ TAXI KYOTO",
        npcAvatar: "🚕",
        npcJapanese: "ご乗車ありがとうございます！どちらまで向かいますか？",
        npcRomaji: "Gojōsha arigatō gozaimasu! Dochira made mukaimasu ka?",
        npcMeaning: "Cảm ơn quý khách đã lên xe! Quý khách muốn đi đến đâu ạ?",
        choices: [
          {
            textJa: "金閣寺（きんかくじ）までお願いします。",
            textRomaji: "Kinkaku-ji made onegaishimasu.",
            textVi: "Làm ơn chở tôi đến Chùa Vàng Kinkaku-ji ạ.",
            politeness: "POLITE",
            score: 100,
            npcFeedback: "Bác tài xế bật đồng hồ tính cước và vui vẻ khởi hành!",
          },
          {
            textJa: "金閣寺！",
            textRomaji: "Kinkaku-ji!",
            textVi: "Chùa Vàng! (Cộc lốc)",
            politeness: "CASUAL",
            score: 65,
            npcFeedback: "Bác tài xế gật đầu rồi lái xe đi.",
          },
        ],
      },
      {
        npcSpeaker: "TÀI XẾ TAXI KYOTO",
        npcAvatar: "🚕",
        npcJapanese: "金閣寺ですね！かしこまりました。20分ほどで到着しますよ。",
        npcRomaji: "Kinkaku-ji desu ne! Kashikomarimashita. Ni-juppun hodo de tōchaku shimasu yo.",
        npcMeaning: "Chùa Vàng đúng không! Tôi hiểu rồi. Khoảng 20 phút nữa là chúng ta sẽ tới nơi nhé.",
        choices: [
          {
            textJa: "お支払いはSuica（スイカ）でできますか？",
            textRomaji: "Oshiharai wa Suica de dekimasu ka?",
            textVi: "Tôi có thể thanh toán bằng thẻ Suica được không bác?",
            politeness: "POLITE",
            score: 100,
            npcFeedback: "Bác tài xế cười tươi chỉ vào máy quẹt thẻ: 'Dạ được chứ, thanh toán không chạm rất tiện lợi!'",
          },
        ],
      },
    ],
  },
];

export function SurvivalClient({ scenarios }: { scenarios: Array<{ id: string; slug: string; title: string; isCompleted: boolean }> }) {
  const router = useRouter();
  const { playClick, playCorrect, playIncorrect, playFanfare, showToast, speak } = useSoundAndTheme();

  const [activeScenario, setActiveScenario] = useState<ScenarioDef | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dialogueHistory, setDialogueHistory] = useState<Array<{ sender: "NPC" | "PLAYER"; textJa: string; textRomaji?: string; textVi?: string; feedback?: string }>>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Speech Recognition (Microphone Voice Input)
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const handleVoiceSpokenRef = useRef<(transcript: string) => void>(() => {});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setMicSupported(true);
        const recognition = new SpeechRecognition();
        recognition.lang = "ja-JP";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results?.[0]?.[0]?.transcript;
          if (transcript) {
            handleVoiceSpokenRef.current(transcript);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const startScenario = (scDef: ScenarioDef) => {
    playClick();
    setActiveScenario(scDef);
    setCurrentStepIndex(0);
    setTotalScore(0);
    setMaxScore(scDef.steps.length * 100);
    setIsCompleted(false);

    // Initial NPC message
    const firstStep = scDef.steps[0];
    setDialogueHistory([
      {
        sender: "NPC",
        textJa: firstStep.npcJapanese,
        textRomaji: firstStep.npcRomaji,
        textVi: firstStep.npcMeaning,
      },
    ]);
    // Auto speak NPC greeting
    speak(firstStep.npcJapanese);
  };

  const handleChoose = (choice: DialogueStep["choices"][0]) => {
    if (!activeScenario) return;

    if (choice.score >= 80) {
      playCorrect();
    } else {
      playIncorrect();
    }

    setTotalScore((prev) => prev + choice.score);

    // Record Player message and NPC feedback
    const nextHistory = [
      ...dialogueHistory,
      {
        sender: "PLAYER" as const,
        textJa: choice.textJa,
        textRomaji: choice.textRomaji,
        textVi: choice.textVi,
        feedback: choice.npcFeedback,
      },
    ];

    if (currentStepIndex < activeScenario.steps.length - 1) {
      const nextStep = activeScenario.steps[currentStepIndex + 1];
      setCurrentStepIndex((prev) => prev + 1);
      setTimeout(() => {
        setDialogueHistory([
          ...nextHistory,
          {
            sender: "NPC",
            textJa: nextStep.npcJapanese,
            textRomaji: nextStep.npcRomaji,
            textVi: nextStep.npcMeaning,
          },
        ]);
        speak(nextStep.npcJapanese);
      }, 700);
    } else {
      // Completed all steps
      setDialogueHistory(nextHistory);
      finishScenario(activeScenario);
    }
  };

  const handleVoiceSpoken = (transcript: string) => {
    if (!activeScenario) return;
    const currentStep = activeScenario.steps[currentStepIndex];
    // Find closest choice by matching characters
    const matched = currentStep.choices.find((c) =>
      c.textJa.includes(transcript) || transcript.includes(c.textJa.slice(0, 3))
    ) || currentStep.choices[0];

    showToast({
      title: `🎙️ Đã nhận diện giọng nói: "${transcript}"`,
      description: `Khớp với phương án: ${matched.textJa}`,
      type: "info",
    });
    handleChoose(matched);
  };
  handleVoiceSpokenRef.current = handleVoiceSpoken;

  const toggleMic = () => {
    if (!recognitionRef.current) {
      showToast({ title: "Trình duyệt chưa hỗ trợ ghi âm tiếng Nhật.", type: "error" });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      playClick();
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch {
        setIsListening(false);
      }
    }
  };

  const finishScenario = async (scDef: ScenarioDef) => {
    setSubmitting(true);
    try {
      // Find database scenario ID if exists
      const dbMatch = scenarios.find((s) => s.slug === scDef.slug);
      if (dbMatch) {
        await fetch("/api/survival/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenarioId: dbMatch.id }),
        });
      }

      playFanfare();
      setIsCompleted(true);
      showToast({
        title: `Vượt qua thử thách: ${scDef.title}!`,
        description: `Chúc mừng bạn đã hoàn thành hội thoại thực chiến và nhận +${scDef.xpReward} XP!`,
        type: "achievement",
      });
      router.refresh();
    } catch {
      setIsCompleted(true);
    }
    setSubmitting(false);
  };

  const currentStep = activeScenario?.steps[currentStepIndex];
  const finalPercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 100;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-torii-600 via-rose-600 to-amber-600 p-6 sm:p-8 text-white shadow-xl">
        <Badge variant="torii" className="bg-white/20 text-white border-white/30 mb-2">
          SURVIVAL COMMUNICATION BATTLE 🍜🎙️
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-black">Hội Thoại Thực Chiến Nhật Bản</h2>
        <p className="text-sm text-rose-100 max-w-2xl mt-1.5 opacity-95 leading-relaxed">
          Bước vào không gian đối thoại sống động như đang du lịch tại Tokyo. Luyện phản xạ đối đáp tự nhiên, nghe phát âm bản xứ hoặc trực tiếp <span className="font-bold underline">nói vào micro</span> để đối đáp!
        </p>
      </div>

      {/* Scenario List */}
      {!activeScenario && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REAL_SCENARIOS.map((scDef) => {
            const dbMatch = scenarios.find((s) => s.slug === scDef.slug);
            const isDone = dbMatch?.isCompleted ?? false;

            return (
              <Card
                key={scDef.id}
                hover
                className={`flex flex-col justify-between overflow-hidden border-2 transition-all ${
                  isDone
                    ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <Badge variant={isDone ? "matcha" : "sakura"}>
                      {isDone ? "✓ Đã thành thục" : scDef.level}
                    </Badge>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      ✨ +{scDef.xpReward} XP
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {scDef.title}
                  </h3>
                  <p className="text-xs font-semibold text-sakura-600 dark:text-sakura-400 mt-1">
                    📍 {scDef.locationName}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-3">
                    {scDef.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant={isDone ? "secondary" : "sakura"}
                    onClick={() => startScenario(scDef)}
                    className="w-full justify-center font-bold"
                  >
                    {isDone ? "🔄 Luyện lại phản xạ" : "⚔️ Vào cuộc đối thoại"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ACTIVE INTERACTIVE COMMUNICATION ARENA */}
      {activeScenario && (
        <div className="max-w-2xl mx-auto space-y-4 animate-in zoom-in-95 duration-200">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-sumi-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase text-sakura-600">Đang thực chiến:</span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {activeScenario.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHints(!showHints)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                  showHints
                    ? "bg-sakura-50 border-sakura-300 text-sakura-600 dark:bg-sakura-950 dark:text-sakura-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
                title="Bật/tắt hiển thị Romaji và dịch nghĩa tiếng Việt"
              >
                {showHints ? "👁️ Đang hiện Romaji & Dịch" : "🔒 Ẩn Romaji & Dịch (Thực chiến)"}
              </button>
              <button
                onClick={() => setActiveScenario(null)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-sumi-800"
              >
                ✕ Rời phòng
              </button>
            </div>
          </div>

          {/* Chat Stream Arena */}
          <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-sumi-950/70 p-4 sm:p-6 min-h-[380px] max-h-[500px] overflow-y-auto space-y-4 shadow-inner">
            {dialogueHistory.map((item, idx) => (
              <div
                key={idx}
                className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 ${
                  item.sender === "PLAYER" ? "justify-end" : "justify-start"
                }`}
              >
                {item.sender === "NPC" && (
                  <div className="w-10 h-10 rounded-2xl bg-torii-500 text-white flex items-center justify-center text-xl shrink-0 shadow-md">
                    {activeScenario.steps[0].npcAvatar}
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl shadow-sm space-y-1 ${
                    item.sender === "PLAYER"
                      ? "bg-gradient-to-r from-sakura-600 to-rose-600 text-white rounded-tr-sm"
                      : "bg-white dark:bg-sumi-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-tl-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${item.sender === "PLAYER" ? "text-rose-100" : "text-slate-400"}`}>
                      {item.sender === "PLAYER" ? "Bạn (Người học)" : activeScenario.steps[0].npcSpeaker}
                    </span>
                    <button
                      onClick={() => speak(item.textJa)}
                      className={`text-xs p-1 rounded hover:opacity-80 ${item.sender === "PLAYER" ? "text-white" : "text-slate-500"}`}
                      title="Nghe lại câu thoại"
                    >
                      🔊
                    </button>
                  </div>

                  <p className="jp-text text-lg sm:text-xl font-black">
                    {item.textJa}
                  </p>

                  {/* Hints: Romaji & Vietnamese meaning toggle */}
                  {showHints && item.textRomaji && (
                    <p className={`text-xs font-semibold ${item.sender === "PLAYER" ? "text-rose-100" : "text-sakura-600 dark:text-sakura-400"}`}>
                      {item.textRomaji}
                    </p>
                  )}

                  {showHints && item.textVi && (
                    <p className={`text-xs ${item.sender === "PLAYER" ? "text-rose-100/90" : "text-slate-500"}`}>
                      👉 {item.textVi}
                    </p>
                  )}

                  {item.feedback && (
                    <div className="mt-2 pt-2 border-t border-white/20 text-xs font-bold text-amber-200">
                      💡 {item.feedback}
                    </div>
                  )}
                </div>

                {item.sender === "PLAYER" && (
                  <div className="w-10 h-10 rounded-2xl bg-sakura-600 text-white flex items-center justify-center text-xl shrink-0 shadow-md">
                    👤
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ACTION / INPUT PANEL */}
          {!isCompleted && currentStep && (
            <Card className="p-4 sm:p-5 space-y-3 border-2 border-sakura-300 dark:border-sakura-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Lựa chọn câu đáp của bạn (Bước {currentStepIndex + 1}/{activeScenario.steps.length})
                </span>

                {/* Microphone Speak Button */}
                {micSupported && (
                  <button
                    onClick={toggleMic}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition ${
                      isListening
                        ? "bg-red-500 border-red-400 text-white animate-pulse"
                        : "bg-slate-100 dark:bg-sumi-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    <span>{isListening ? "🔴 Đang nghe..." : "🎙️ Nói tiếng Nhật"}</span>
                  </button>
                )}
              </div>

              {/* Choices Buttons */}
              <div className="grid gap-2.5">
                {currentStep.choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleChoose(choice)}
                    className="flex flex-col text-left p-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-sakura-500 bg-white dark:bg-sumi-900 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="jp-text font-black text-base text-slate-900 dark:text-white group-hover:text-sakura-600 transition-colors">
                        {choice.textJa}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                        {choice.politeness === "POLITE" ? "🌟 Lịch sự chuẩn" : choice.politeness === "CASUAL" ? "💬 Thông thường" : "⚠️ Cộc lốc"}
                      </span>
                    </div>

                    {showHints && (
                      <span className="text-xs font-semibold text-sakura-600 dark:text-sakura-400 mt-0.5">
                        {choice.textRomaji}
                      </span>
                    )}

                    {showHints && (
                      <span className="text-xs text-slate-500 mt-0.5">
                        👉 {choice.textVi}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Finish Celebration Summary */}
          {isCompleted && (
            <Card className="text-center p-8 border-2 border-emerald-400 dark:border-emerald-800 space-y-4">
              <div className="text-6xl animate-bounce">🎌✨🍜</div>
              <Badge variant="matcha">Hoàn Thành Xuất Sắc</Badge>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Khả Năng Phản Xạ: {finalPercentage >= 90 ? "Hạng S (Xuất Chúng)" : finalPercentage >= 75 ? "Hạng A (Chuẩn Bản Xứ)" : "Hạng B (Đạt Yêu Cầu)"}!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Bạn đã xử lý tình huống giao tiếp đời thực rất trôi chảy và tự tin.
              </p>

              <div className="inline-block bg-amber-50 dark:bg-amber-950 border border-amber-300 text-amber-800 dark:text-amber-300 font-black px-5 py-2.5 rounded-2xl text-base shadow-sm">
                ✨ +{activeScenario.xpReward} XP Đã Nhận
              </div>

              <div className="pt-2">
                <Button
                  variant="sakura"
                  size="md"
                  onClick={() => setActiveScenario(null)}
                  className="font-bold px-8"
                >
                  Hoàn thành thử thách 🏁
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
