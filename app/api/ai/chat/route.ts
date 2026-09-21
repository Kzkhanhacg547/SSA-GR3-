import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

// ─── Rule-Based Japanese Intelligence Engine (Offline/Local) ────────────────
const SENSEI_RULES: { pattern: RegExp; respond: (m: RegExpMatchArray) => string }[] = [
  {
    pattern: /(?:は|が).*(?:違い|違う|使い分け|difference)/,
    respond: () =>
      "とても良い質問です！✨\n\n**は (wa)** là trợ từ chủ đề — dùng để nêu chủ đề đang nói tới, mang hàm nghĩa **đối chiếu/tương phản**.\n**が (ga)** là trợ từ chủ ngữ — xác định **ai/cái gì** thực sự thực hiện hành động.\n\n**Ví dụ:**\n• 私**は**学生です。→ *Tôi (thì) là học sinh.* (nêu chủ đề \"tôi\")\n• 誰**が**学生ですか？→ *Ai là học sinh?* (hỏi/xác định chủ ngữ)\n\n💡 **Mẹo nhớ:** Khi bạn muốn **nhấn mạnh hoặc hỏi ai/cái gì**, dùng **が**. Khi muốn **đặt bối cảnh** hay nói về chủ đề, dùng **は**。\n\nがんばってください！🌸",
  },
  {
    pattern: /(?:教えて|おしえて|意味|いみ|とは|what is|explain|とは何|なに)/i,
    respond: (m) => {
      const q = m[0];
      if (/です/.test(q))
        return "**です (desu)** là **trợ động từ kính ngữ** dùng để kết thúc câu khẳng định lịch sự.\n\n**Cấu trúc:** [danh từ/tính từ đuôい] + **です**\n\n• これはペン**です**。→ *Đây là cây bút.*\n• 私は学生**です**。→ *Tôi là học sinh.*\n\nPhủ định: **ではありません** (rất trang trọng) hoặc **じゃないです** (thường ngày)\n\nがんばってください！🌸";
      return "Xin chào！私はAoi Sensei (葵先生) です。🌸\n\nHãy đặt câu hỏi cụ thể hơn về từ hoặc ngữ pháp bạn muốn học, tôi sẽ giải thích chi tiết nhé！\n\n**Gợi ý:** Bạn có thể hỏi:\n• Sự khác nhau giữa は và が\n• Cách dùng て-form (thể te)\n• Ý nghĩa của một từ tiếng Nhật cụ thể";
    },
  },
  {
    pattern: /(?:て形|て-form|てform|てください|てもいい|ている)/,
    respond: () =>
      "**て形 (te-kei / Te-form)** — Thể Te cực kỳ quan trọng trong tiếng Nhật！\n\n**Cách chia động từ nhóm 1 (u-verb):**\n| Đuôi gốc | Đổi thành |\n|---|---|\n| く → | いて |\n| ぐ → | いで |\n| す → | して |\n| つ/る/う → | って |\n| む/ぬ/ぶ → | んで |\n\n**Cách dùng phổ biến:**\n• **〜てください** → Làm ơn hãy... (yêu cầu lịch sự)\n• **〜ています** → Đang... / Là trạng thái... (tiếp diễn)\n• **〜てもいいですか？** → Tôi có thể... không?\n• **〜てから** → Sau khi...\n\n**Ví dụ:** 食べ**てから**、学校に行きます。→ *Sau khi ăn, tôi đi học.*\n\n練習しましょう！💪",
  },
  {
    pattern: /(?:たい|tai form|muốn|want to)/,
    respond: () =>
      "**〜たいです (tai desu)** — diễn đạt **mong muốn cá nhân** 'Tôi muốn...'\n\n**Cấu trúc:** [V-stem (bỏ ます)] + **たいです**\n\n**Ví dụ:**\n• 食べます → 食べ**たいです** → Tôi muốn ăn.\n• 日本語を話し**たいです**。→ Tôi muốn nói tiếng Nhật.\n• 日本へ行き**たいです**。→ Tôi muốn đến Nhật.\n\n⚠️ **Lưu ý quan trọng:** たい chỉ dùng cho **ngôi thứ nhất** (tôi). Với người khác, dùng **〜たがっている**.\n\nあなたは何がしたいですか？😊",
  },
  {
    pattern: /(?:より|のほう|ほうが|comparison|so sánh|hơn)/,
    respond: () =>
      "**So Sánh trong tiếng Nhật** — đơn giản hơn tiếng Anh nhiều！\n\n**Cấu trúc:** [A] **より** [B] **のほうが** [tính từ] です\n→ *B [tính từ] hơn A*\n\n**Ví dụ:**\n• 東京**より**大阪**のほうが**好きです。→ *Tôi thích Osaka hơn Tokyo.*\n• バス**より**電車**のほうが**速いです。→ *Tàu điện nhanh hơn xe buýt.*\n\n**Hỏi về hai lựa chọn:** AとBと、どちらのほうが〜ですか？\n→ *Giữa A và B, cái nào [tính từ] hơn?*\n\n**Trả lời:** Aのほうが〜です。/ Bのほうが〜です。\n\nすごく便利な文法ですね！🎌",
  },
  {
    pattern: /(?:から|because|なぜなら|理由|lý do|tại sao why)/,
    respond: () =>
      "**〜から (kara)** — diễn đạt **nguyên nhân/lý do** 'vì...'\n\n**Cấu trúc:** [Nguyên nhân] + **から** + [Kết quả]\n\n**Ví dụ:**\n• 雨が降っている**から**、家にいます。→ *Vì đang mưa nên tôi ở nhà.*\n• 日本語が好き**だから**、毎日勉強します。→ *Vì tôi thích tiếng Nhật nên học mỗi ngày.*\n• 遅れてすみません。電車が遅れた**から**です。→ *Xin lỗi vì đến trễ. Tại tàu bị muộn.*\n\n**Lưu ý:** Đặt **から** SAU nguyên nhân (ngược với tiếng Việt 'vì' đặt trước).\n\nわかりましたか？😊",
  },
  {
    pattern: /(?:sửa|correct|check|kiểm tra|lỗi|error)/i,
    respond: () =>
      "Vâng, rất vui được giúp bạn kiểm tra câu！📝\n\nHãy **viết câu tiếng Nhật** bạn muốn kiểm tra vào đây, tôi sẽ:\n1. ✅ Xác nhận câu đúng\n2. 🔴 Chỉ ra lỗi sai (nếu có)\n3. 💡 Giải thích lý do và cách sửa\n4. ✨ Đưa ra câu chuẩn nhất\n\nVí dụ: Bạn viết **「私は学校に行きたいです」** và tôi sẽ phân tích chi tiết！",
  },
  {
    pattern: /(?:hiragana|hiragana|ひらがな|平仮名|あいうえお)/i,
    respond: () =>
      "**Hiragana (ひらがな)** — Bảng chữ cái nền tảng tiếng Nhật 🌸\n\n**46 ký tự cơ bản** được nhóm theo hàng:\n\n| Hàng | あ段 | い段 | う段 | え段 | お段 |\n|---|---|---|---|---|---|\n| あ行 | あ(a) | い(i) | う(u) | え(e) | お(o) |\n| か行 | か(ka) | き(ki) | く(ku) | け(ke) | こ(ko) |\n| さ行 | さ(sa) | し(shi) | す(su) | せ(se) | そ(so) |\n| た行 | た(ta) | ち(chi) | つ(tsu) | て(te) | と(to) |\n| な行 | な(na) | に(ni) | ぬ(nu) | ね(ne) | の(no) |\n\n💡 **Mẹo học:** Bắt đầu từ hàng あ, か, さ. Luyện viết tay và học kèm âm thanh sẽ nhớ rất nhanh！\n\nBạn có muốn tập luyện Hiragana trong **Kana Lab** không？📖",
  },
  {
    pattern: /(?:katakana|カタカナ|片仮名)/i,
    respond: () =>
      "**Katakana (カタカナ)** — Dùng để viết từ vay mượn tiếng nước ngoài！\n\n**Khi nào dùng Katakana?**\n• 🌍 Từ vay mượn: **コーヒー** (koohii = cà phê), **テレビ** (terebi = TV)\n• 🐾 Tên động vật/sinh vật trong văn bản khoa học\n• 🎮 Hiệu ứng âm thanh trong manga: **ドキドキ** (tim đập thình thịch)\n• 👤 Tên nước ngoài: **ベトナム** (Betonamu = Việt Nam)\n\n**Ví dụ thú vị:**\n• **アイスクリーム** = Ice cream\n• **スマートフォン** = Smartphone\n• **ハンバーガー** = Hamburger\n\n**Fun fact:** Tên bạn cũng được viết bằng Katakana khi ở Nhật！😄",
  },
  {
    pattern: /(?:kanji|漢字|かんじ)/i,
    respond: () =>
      "**漢字 (Kanji)** — Chữ Hán được Nhật Bản tiếp nhận và phát triển 🏯\n\n**Sự thật về Kanji:**\n• Có khoảng **2,136 Joyo Kanji** (chữ thông dụng nhất)\n• JLPT N5 yêu cầu học khoảng **100 chữ** cơ bản\n• Mỗi Kanji có thể có nhiều cách đọc: **音読み (On'yomi)** và **訓読み (Kun'yomi)**\n\n**Ví dụ Kanji N5:**\n| Kanji | On'yomi | Kun'yomi | Nghĩa |\n|---|---|---|---|\n| 日 | にち/じつ | ひ | ngày/mặt trời |\n| 山 | さん | やま | núi |\n| 水 | すい | みず | nước |\n| 学 | がく | まな | học |\n\n💡 **Tip:** Học Kanji theo **bộ thủ (radical)** sẽ dễ nhớ hơn nhiều！\n\nBạn muốn học Kanji nào trước？🎌",
  },
  {
    pattern: /(?:xin chào|こんにちは|hello|hi|konnichiwa)/i,
    respond: () =>
      "こんにちは！👋 Chào mừng bạn đến với lớp học của **葵先生 (Aoi Sensei)**！🌸\n\nTôi là gia sư AI chuyên dạy tiếng Nhật. Tôi có thể giúp bạn:\n\n🎯 **Ngữ pháp:** Giải thích cấu trúc, phân biệt cách dùng\n📝 **Từ vựng:** Dịch nghĩa, ví dụ câu, cách phát âm\n✅ **Sửa lỗi:** Kiểm tra câu tiếng Nhật của bạn\n💬 **Hội thoại:** Luyện nói theo tình huống thực tế\n\nHãy hỏi bất cứ điều gì về tiếng Nhật nhé！がんばってください！💪",
  },
  {
    pattern: /(?:luyện|hội thoại|roleplay|role play|tình huống|scenario|practice)/i,
    respond: () =>
      "Tuyệt！Hãy luyện hội thoại theo tình huống thực tế！🗣️\n\nBạn muốn luyện tình huống nào?\n\n🍜 **Nhà hàng:** Gọi món, trả tiền\n🚉 **Ga tàu:** Hỏi đường, mua vé\n🏪 **Cửa hàng:** Mua sắm, hỏi giá\n🏨 **Khách sạn:** Check-in, yêu cầu phòng\n👋 **Gặp gỡ:** Tự giới thiệu, chào hỏi\n\nHãy gõ tên tình huống, tôi sẽ đóng vai NPC và bắt đầu cuộc hội thoại！✨\n\n*Gợi ý: Gõ* **「nhà hàng」** *để bắt đầu ngay！*",
  },
  {
    pattern: /(?:nhà hàng|レストラン|restaurant|gọi món|order)/i,
    respond: () =>
      "🍜 **Luyện hội thoại: Tại Nhà Hàng Nhật**\n\n---\n\n*[Bạn bước vào nhà hàng. Nhân viên chào đón...]*\n\n**店員 (nhân viên):** いらっしゃいませ！何名様ですか？\n*(Irasshaimase! Nanmei-sama desu ka?)*\n*(Chào quý khách! Quý khách mấy người ạ?)*\n\n---\nBây giờ **bạn trả lời bằng tiếng Nhật** nhé！Ví dụ:\n• 一人です。*(Hitori desu = Một người)*\n• 二人です。*(Futari desu = Hai người)*\n• 三人です。*(San-nin desu = Ba người)*\n\n*Mẹo: Sau đó nhân viên sẽ hỏi* 「ご注文はお決まりですか？」*(Bạn đã chọn món chưa?)*",
  },
];

function generateSenseiResponse(userMessage: string): string {
  const normalized = userMessage.toLowerCase();

  for (const rule of SENSEI_RULES) {
    const match = normalized.match(rule.pattern);
    if (match) {
      return rule.respond(match);
    }
  }

  // Generic thoughtful response
  return `ご質問ありがとうございます！🌸\n\nTôi hiểu bạn đang hỏi về: **"${userMessage}"**\n\nĐây là một chủ đề thú vị trong tiếng Nhật！Để giải thích chính xác nhất, hãy cho tôi biết thêm bối cảnh:\n\n• Bạn gặp câu/từ này ở đâu (trong bài học, khi xem phim, v.v.)?\n• Bạn đã hiểu phần nào rồi?\n• Bạn muốn sử dụng nó trong tình huống nào?\n\nHoặc bạn có thể thử các câu hỏi phổ biến:\n• **「はとがの違いは？」** — Sự khác nhau giữa は và が\n• **「て形の使い方は？」** — Cách dùng Te-form\n• **「〜たいですを教えて」** — Giải thích cấu trúc たいです\n\nがんばってください！💪🌸`;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const convId = searchParams.get("conversationId");

  if (convId) {
    const conv = await prisma.aiConversation.findFirst({
      where: { id: convId, userId: uid },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(conv);
  }

  // Return list of conversations
  const conversations = await prisma.aiConversation.findMany({
    where: { userId: uid },
    include: { messages: { take: 1, orderBy: { createdAt: "desc" } } },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ conversations });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { message, conversationId, apiKey } = body as {
    message?: string;
    conversationId?: string;
    apiKey?: string;
  };

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // Get or create conversation
  let conv = conversationId
    ? await prisma.aiConversation.findFirst({ where: { id: conversationId, userId: uid } })
    : null;

  if (!conv) {
    conv = await prisma.aiConversation.create({
      data: {
        userId: uid,
        title: message.slice(0, 60),
        provider: "RULE_ENGINE",
        model: "aoi-sensei-v1",
      },
    });
  }

  // Save user message
  await prisma.aiMessage.create({
    data: { conversationId: conv.id, role: "user", content: message.trim() },
  });

  // Generate AI response
  let aiResponse: string;

  // Check for Gemini API key (from client parameter, header, or server env)
  const geminiKey = apiKey?.trim() || req.headers.get("x-gemini-key")?.trim() || process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const history = await prisma.aiMessage.findMany({
        where: { conversationId: conv.id },
        orderBy: { createdAt: "asc" },
        take: 12,
      });

      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  "Bạn là Aoi Sensei (葵先生), một gia sư tiếng Nhật AI thân thiện, kiên nhẫn và chuyên nghiệp trên ứng dụng Nihon Quest. Nhiệm vụ của bạn:\n- Giải thích ngữ pháp và từ vựng tiếng Nhật từ sơ cấp N5 đến nâng cao một cách sinh động, dễ hiểu\n- Luôn cung cấp câu ví dụ thực tế kèm Kanji, Furigana/Hiragana, Romaji và nghĩa tiếng Việt\n- Sửa lỗi câu tiếng Nhật một cách chi tiết: chỉ ra chỗ sai và viết lại câu chuẩn tự nhiên của người bản xứ\n- Khuyến khích học viên, dùng Markdown đẹp mắt (bảng, danh sách, in đậm) và kết thúc bằng câu hỏi gợi mở hoặc lời động viên bằng tiếng Nhật.\nHãy luôn trả lời bằng tiếng Việt thân thiện.",
              },
            ],
          },
          ...history.map((m) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
          })),
        ],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      };

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000),
        }
      );

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        aiResponse = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || generateSenseiResponse(message);
        await prisma.aiConversation.update({
          where: { id: conv.id },
          data: { provider: "GOOGLE_GEMINI", model: "gemini-1.5-flash" },
        });
      } else {
        aiResponse = generateSenseiResponse(message);
      }
    } catch {
      aiResponse = generateSenseiResponse(message);
    }
  } else {
    aiResponse = generateSenseiResponse(message);
  }

  // Save AI message
  const aiMsg = await prisma.aiMessage.create({
    data: { conversationId: conv.id, role: "assistant", content: aiResponse },
  });

  // Update conversation
  await prisma.aiConversation.update({
    where: { id: conv.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ conversationId: conv.id, message: aiMsg });
}
