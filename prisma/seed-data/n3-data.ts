import { SeedKanji, SeedVocab } from "./kanji-vocab";

// ─────────────────────────────────────────────────────────────────────────────
// JLPT N3 KANJI SEED DATA
// ─────────────────────────────────────────────────────────────────────────────
export const KANJI_N3: SeedKanji[] = [
  { character: "政", meaning: "Chính trị, Chính phủ (Chính)", strokeCount: 9, jlptLevel: "N3", readings: [{ reading: "セイ", type: "ONYOMI" }, { reading: "ショウ", type: "ONYOMI" }, { reading: "まつりごと", type: "KUNYOMI" }] },
  { character: "治", meaning: "Cai trị, Chữa lành (Trị)", strokeCount: 8, jlptLevel: "N3", readings: [{ reading: "ジ", type: "ONYOMI" }, { reading: "チ", type: "ONYOMI" }, { reading: "おさ・める", type: "KUNYOMI" }, { reading: "なお・る", type: "KUNYOMI" }] },
  { character: "経", meaning: "Trải qua, Kinh tế (Kinh)", strokeCount: 11, jlptLevel: "N3", readings: [{ reading: "ケイ", type: "ONYOMI" }, { reading: "キョウ", type: "ONYOMI" }, { reading: "へ・る", type: "KUNYOMI" }] },
  { character: "済", meaning: "Kết thúc, Cứu giúp (Tế)", strokeCount: 11, jlptLevel: "N3", readings: [{ reading: "サイ", type: "ONYOMI" }, { reading: "す・む", type: "KUNYOMI" }, { reading: "す・ます", type: "KUNYOMI" }] },
  { character: "際", meaning: "Dịp, Khi, Quốc tế (Tế)", strokeCount: 14, jlptLevel: "N3", readings: [{ reading: "サイ", type: "ONYOMI" }, { reading: "きわ", type: "KUNYOMI" }] },
  { character: "関", meaning: "Quan hệ, Liên quan (Quan)", strokeCount: 14, jlptLevel: "N3", readings: [{ reading: "カン", type: "ONYOMI" }, { reading: "せき", type: "KUNYOMI" }, { reading: "かか・わる", type: "KUNYOMI" }] },
  { character: "係", meaning: "Chịu trách nhiệm, Người phụ trách (Hệ)", strokeCount: 9, jlptLevel: "N3", readings: [{ reading: "ケイ", type: "ONYOMI" }, { reading: "かかり", type: "KUNYOMI" }] },
  { character: "対", meaning: "Đối diện, Đối với (Đối)", strokeCount: 7, jlptLevel: "N3", readings: [{ reading: "タイ", type: "ONYOMI" }, { reading: "ツイ", type: "ONYOMI" }] },
  { character: "象", meaning: "Hiện tượng, Con voi (Tượng)", strokeCount: 12, jlptLevel: "N3", readings: [{ reading: "ショウ", type: "ONYOMI" }, { reading: "ゾウ", type: "ONYOMI" }] },
  { character: "結", meaning: "Kết nối, Kết quả (Kết)", strokeCount: 12, jlptLevel: "N3", readings: [{ reading: "ケツ", type: "ONYOMI" }, { reading: "むす・ぶ", type: "KUNYOMI" }, { reading: "ゆ・う", type: "KUNYOMI" }] },
  { character: "果", meaning: "Thành quả, Trái cây (Quả)", strokeCount: 8, jlptLevel: "N3", readings: [{ reading: "カ", type: "ONYOMI" }, { reading: "は・たす", type: "KUNYOMI" }] },
  { character: "確", meaning: "Chính xác, Xác nhận (Xác)", strokeCount: 15, jlptLevel: "N3", readings: [{ reading: "カク", type: "ONYOMI" }, { reading: "たし・か", type: "KUNYOMI" }] },
  { character: "認", meaning: "Nhận biết, Công nhận (Nhận)", strokeCount: 14, jlptLevel: "N3", readings: [{ reading: "ニン", type: "ONYOMI" }, { reading: "みと・める", type: "KUNYOMI" }] },
  { character: "設", meaning: "Thiết lập, Thành lập (Thiết)", strokeCount: 11, jlptLevel: "N3", readings: [{ reading: "セツ", type: "ONYOMI" }, { reading: "もう・ける", type: "KUNYOMI" }] },
  { character: "計", meaning: "Kế hoạch, Đo đạc (Kế)", strokeCount: 9, jlptLevel: "N3", readings: [{ reading: "ケイ", type: "ONYOMI" }, { reading: "はか・る", type: "KUNYOMI" }] },
  { character: "応", meaning: "Đáp ứng, Ứng tuyển (Ứng)", strokeCount: 7, jlptLevel: "N3", readings: [{ reading: "オウ", type: "ONYOMI" }, { reading: "こた・える", type: "KUNYOMI" }] },
  { character: "規", meaning: "Quy tắc, Khuôn mẫu (Quy)", strokeCount: 11, jlptLevel: "N3", readings: [{ reading: "キ", type: "ONYOMI" }] },
  { character: "則", meaning: "Nguyên tắc, Quy luật (Tắc)", strokeCount: 9, jlptLevel: "N3", readings: [{ reading: "ソク", type: "ONYOMI" }] },
  { character: "状", meaning: "Tình trạng, Hình dáng (Trạng)", strokeCount: 7, jlptLevel: "N3", readings: [{ reading: "ジョウ", type: "ONYOMI" }] },
  { character: "態", meaning: "Thái độ, Trạng thái (Thái)", strokeCount: 14, jlptLevel: "N3", readings: [{ reading: "タイ", type: "ONYOMI" }] },
  { character: "効", meaning: "Hiệu quả, Công hiệu (Hiệu)", strokeCount: 8, jlptLevel: "N3", readings: [{ reading: "コウ", type: "ONYOMI" }, { reading: "き・く", type: "KUNYOMI" }] },
  { character: "差", meaning: "Khác biệt, Sai lệch (Sai)", strokeCount: 10, jlptLevel: "N3", readings: [{ reading: "サ", type: "ONYOMI" }, { reading: "さ・す", type: "KUNYOMI" }] },
  { character: "別", meaning: "Đặc biệt, Phân biệt (Biệt)", strokeCount: 7, jlptLevel: "N3", readings: [{ reading: "ベツ", type: "ONYOMI" }, { reading: "わか・れる", type: "KUNYOMI" }] },
  { character: "情", meaning: "Tình cảm, Thông tin (Tình)", strokeCount: 11, jlptLevel: "N3", readings: [{ reading: "ジョウ", type: "ONYOMI" }, { reading: "なさ・け", type: "KUNYOMI" }] },
  { character: "報", meaning: "Báo cáo, Tin tức (Báo)", strokeCount: 12, jlptLevel: "N3", readings: [{ reading: "ホウ", type: "ONYOMI" }, { reading: "むく・いる", type: "KUNYOMI" }] },
];

// ─────────────────────────────────────────────────────────────────────────────
// JLPT N3 VOCABULARY SEED DATA
// ─────────────────────────────────────────────────────────────────────────────
export const VOCABULARY_N3: SeedVocab[] = [
  {
    word: "解決する",
    kana: "かいけつする",
    kanji: "解決する",
    romaji: "kaiketsu suru",
    meaning: "Giải quyết (vấn đề, tranh chấp)",
    partOfSpeech: "verb",
    jlptLevel: "N3",
    exampleJapanese: "チーム全員で問題を解決しました。",
    exampleRomaji: "Chīmu zen'in de mondai o kaiketsu shimashita.",
    exampleMeaning: "Toàn bộ nhóm đã cùng nhau giải quyết vấn đề.",
  },
  {
    word: "影響",
    kana: "えいきょう",
    kanji: "影響",
    romaji: "eikyō",
    meaning: "Ảnh hưởng, tác động",
    partOfSpeech: "noun",
    jlptLevel: "N3",
    exampleJapanese: "天候が観光客の数に大きな影響を与えています。",
    exampleRomaji: "Tenkō ga kankōkyaku no kazu ni ōkina eikyō o ataete imasu.",
    exampleMeaning: "Thời tiết đang tạo ra ảnh hưởng lớn đến lượng khách du lịch.",
  },
  {
    word: "積極的",
    kana: "せっきょくてき",
    kanji: "積極的",
    romaji: "sekkyokuteki",
    meaning: "Tích cực, chủ động",
    partOfSpeech: "adjective",
    jlptLevel: "N3",
    exampleJapanese: "日本語の会話練習に積極的に参加します。",
    exampleRomaji: "Nihongo no kaiwa renshū ni sekkyokuteki ni sanka shimasu.",
    exampleMeaning: "Tôi tích cực tham gia vào các buổi luyện đàm thoại tiếng Nhật.",
  },
  {
    word: "具体的",
    kana: "ぐたいてき",
    kanji: "具体的",
    romaji: "gutaiteki",
    meaning: "Cụ thể, rõ ràng",
    partOfSpeech: "adjective",
    jlptLevel: "N3",
    exampleJapanese: "具体的な例を挙げて説明してください。",
    exampleRomaji: "Gutaiteki na rei o agete setsumei shite kudasai.",
    exampleMeaning: "Xin vui lòng đưa ra ví dụ cụ thể để giải thích.",
  },
  {
    word: "集中する",
    kana: "しゅうちゅうする",
    kanji: "集中する",
    romaji: "shūchū suru",
    meaning: "Tập trung cao độ",
    partOfSpeech: "verb",
    jlptLevel: "N3",
    exampleJapanese: "静かな部屋で勉強に集中できました。",
    exampleRomaji: "Shizuka na heya de benkyō ni shūchū dekimashita.",
    exampleMeaning: "Trong căn phòng yên tĩnh, tôi đã có thể tập trung học tập.",
  },
  {
    word: "担当者",
    kana: "たんとうしゃ",
    kanji: "担当者",
    romaji: "tantōsha",
    meaning: "Người phụ trách, người đại diện",
    partOfSpeech: "noun",
    jlptLevel: "N3",
    exampleJapanese: "このプロジェクトの担当者は田中さんです。",
    exampleRomaji: "Kono purojekuto no tantōsha wa Tanaka-san desu.",
    exampleMeaning: "Người phụ trách dự án này là anh Tanaka.",
  },
  {
    word: "状況",
    kana: "じょうきょう",
    kanji: "状況",
    romaji: "jōkyō",
    meaning: "Tình hình, tình trạng hiện tại",
    partOfSpeech: "noun",
    jlptLevel: "N3",
    exampleJapanese: "現在の進捗状況を報告いたします。",
    exampleRomaji: "Genzai no shinchoku jōkyō o hōkoku itashimasu.",
    exampleMeaning: "Tôi xin phép báo cáo tình hình tiến độ hiện tại.",
  },
  {
    word: "印象",
    kana: "いんしょう",
    kanji: "印象",
    romaji: "inshō",
    meaning: "Ấn tượng",
    partOfSpeech: "noun",
    jlptLevel: "N3",
    exampleJapanese: "彼の第一印象はとても誠実でした。",
    exampleRomaji: "Kare no dai-ichi inshō wa totemo seijitsu deshita.",
    exampleMeaning: "Ấn tượng đầu tiên về anh ấy là rất chân thành.",
  },
  {
    word: "緊張する",
    kana: "きんちょうする",
    kanji: "緊張する",
    romaji: "kinchō suru",
    meaning: "Căng thẳng, hồi hộp",
    partOfSpeech: "verb",
    jlptLevel: "N3",
    exampleJapanese: "面接の前は誰でも緊張します。",
    exampleRomaji: "Mensetsu no mae wa dare demo kinchō shimasu.",
    exampleMeaning: "Trước giờ phỏng vấn thì ai cũng có chút hồi hộp.",
  },
  {
    word: "相談する",
    kana: "そうだんする",
    kanji: "相談する",
    romaji: "sōdan suru",
    meaning: "Trao đổi, thảo luận xin ý kiến",
    partOfSpeech: "verb",
    jlptLevel: "N3",
    exampleJapanese: "進路について先生に相談しました。",
    exampleRomaji: "Shinro ni tsuite sensei ni sōdan shimashita.",
    exampleMeaning: "Tôi đã trao đổi với thầy giáo về định hướng tương lai.",
  },
  {
    word: "努力",
    kana: "どりょく",
    kanji: "努力",
    romaji: "doryoku",
    meaning: "Nỗ lực, cố gắng không ngừng",
    partOfSpeech: "noun",
    jlptLevel: "N3",
    exampleJapanese: "日々の努力が必ず実を結びます。",
    exampleRomaji: "Hibi no doryoku ga kanarazu mi o musubimasu.",
    exampleMeaning: "Nỗ lực mỗi ngày nhất định sẽ gặt hái quả ngọt.",
  },
  {
    word: "申し込む",
    kana: "もうしこむ",
    kanji: "申し込む",
    romaji: "mōshikomu",
    meaning: "Đăng ký, ứng tuyển",
    partOfSpeech: "verb",
    jlptLevel: "N3",
    exampleJapanese: "JLPTの試験に申し込みました。",
    exampleRomaji: "JLPT no shiken ni mōshikomimashita.",
    exampleMeaning: "Tôi đã hoàn tất đăng ký kỳ thi JLPT.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// JLPT N3 GRAMMAR SEED DATA
// ─────────────────────────────────────────────────────────────────────────────
export const GRAMMAR_N3 = [
  {
    title: "〜わけがない (wake ga nai)",
    level: "N3",
    meaning: "Tuyệt đối không thể nào... / Chắc chắn không có chuyện...",
    structure: "[Thể thông thường / Tính từ -na + な / Danh từ + の] + わけがない",
    commonMistakes: "Dùng khi người nói khẳng định chắc chắn 100% dựa trên căn cứ logic hoặc trải nghiệm thực tế.",
    examples: [
      { japanese: "彼がそんな嘘をつくわけがありません。", romaji: "Kare ga sonna uso o tsuku wake ga arimasen.", meaning: "Tuyệt đối không thể nào có chuyện anh ấy lại nói dối như thế." },
      { japanese: "こんな難しい試験、一日で合格できるわけがない。", romaji: "Konna muzukashii shiken, ichinichi de gōkaku dekiru wake ga nai.", meaning: "Kỳ thi khó như thế này làm sao mà đỗ chỉ sau một ngày học được." },
    ],
  },
  {
    title: "〜に関して (ni kanshite)",
    level: "N3",
    meaning: "Liên quan đến... / Về vấn đề... (Trang trọng hơn 〜について)",
    structure: "[Danh từ] + に関して / に関する [Danh từ]",
    commonMistakes: "Khi bổ nghĩa cho danh từ phía sau, đổi thành に関する (Ví dụ: 環境問題に関する本).",
    examples: [
      { japanese: "日本の伝統文化に関して研究しています。", romaji: "Nihon no dentō bunka ni kanshite kenkyū shite imasu.", meaning: "Tôi đang nghiên cứu liên quan đến văn hóa truyền thống Nhật Bản." },
      { japanese: "この件に関する質問はありますか？", romaji: "Kono ken ni kansuru shitsumon wa arimasu ka?", meaning: "Có câu hỏi nào liên quan đến sự việc này không ạ?" },
    ],
  },
  {
    title: "〜に対して (ni taishite)",
    level: "N3",
    meaning: "Đối với... / Trái ngược với...",
    structure: "[Danh từ] + に対して / に対する [Danh từ]",
    commonMistakes: "Có 2 nghĩa: (1) Hướng thái độ/hành vi về đối tượng nào đó, (2) So sánh sự tương phản giữa 2 chủ thể.",
    examples: [
      { japanese: "お客様に対して丁寧な言葉を使います。", romaji: "Okyakusama ni taishite teinei na kotoba o tsukaimasu.", meaning: "Sử dụng lời lẽ lịch thiệp và tôn trọng đối với quý khách hàng." },
      { japanese: "兄が活発なのに対して、弟はおとなしいです。", romaji: "Ani ga kappatsu na no ni taishite, otōto wa otonashii desu.", meaning: "Trái ngược với người anh hiếu động, người em lại rất trầm tính." },
    ],
  },
  {
    title: "〜たとたん (ta totan)",
    level: "N3",
    meaning: "Ngay khi vừa... thì lập tức... (Bất ngờ xảy ra)",
    structure: "Động từ thể Quá khứ (た) + とたん(に)",
    commonMistakes: "Vế sau là sự việc bất ngờ xảy ra ngoài ý muốn của người nói, không dùng cho ý chí hay mệnh lệnh của bản thân.",
    examples: [
      { japanese: "窓を開けたら、冷たい風が入ってきました。", romaji: "Mado o aketa totan, tsumetai kaze ga haitte kimashita.", meaning: "Ngay khi vừa mở cửa sổ ra thì luồng gió lạnh lập tức ùa vào." },
      { japanese: "薬を飲んだとたんに眠くなりました。", romaji: "Kusuri o nonda totan ni nemuku narimashita.", meaning: "Vừa uống thuốc xong cái là thấy buồn ngủ ngay." },
    ],
  },
  {
    title: "〜うちに (uchi ni)",
    level: "N3",
    meaning: "Trong khi còn... / Nhân lúc đang... (Trước khi trạng thái thay đổi)",
    structure: "[Động từ thể Từ điển / thể ない / Tính từ / Danh từ + の] + うちに",
    commonMistakes: "Nghĩa 1: Tranh thủ làm việc gì đó khi điều kiện thuận lợi còn tồn tại (Nhân lúc cà phê còn nóng hãy uống đi). Nghĩa 2: Trong quá trình làm gì thì một sự biến đổi âm thầm diễn ra.",
    examples: [
      { japanese: "熱いうちに召し上がってください。", romaji: "Atsui uchi ni meshiagatte kudasai.", meaning: "Xin mời dùng ngay nhân lúc món ăn còn đang nóng hổi." },
      { japanese: "日本にいるうちに富士山に登りたいです。", romaji: "Nihon ni iru uchi ni Fujisan ni noboritai desu.", meaning: "Nhân lúc còn ở Nhật Bản, tôi muốn leo núi Phú Sĩ một lần." },
    ],
  },
  {
    title: "〜に違いない (ni chigainai)",
    level: "N3",
    meaning: "Chắc chắn là... / Nhất định là... (Phán đoán quả quyết)",
    structure: "[Thể thông thường / Danh từ / Tính từ -na] + に違いない",
    commonMistakes: "Biểu thị sự tin tưởng mạnh mẽ của người nói dựa trên một căn cứ rõ ràng nào đó.",
    examples: [
      { japanese: "毎日熱心に勉強しているから、彼は合格するに違いありません。", romaji: "Mainichi nesshin ni benkyō shite iru kara, kare wa gōkaku suru ni chigai arimasen.", meaning: "Vì ngày nào cũng chăm chỉ học nên chắc chắn anh ấy sẽ đỗ." },
      { japanese: "あんなに人が並んでいるから、美味しい店に違いない。", romaji: "Anna ni hito ga narande iru kara, oishii mise ni chigai nai.", meaning: "Người xếp hàng đông như thế chắc chắn là quán ăn ngon rồi." },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// JLPT N3 LESSONS & QUIZZES SEED DATA
// ─────────────────────────────────────────────────────────────────────────────
export const LESSONS_N3 = [
  {
    slug: "n3-lesson-01-office-communication",
    title: "Bài 01 (N3): Giao Tiếp Nơi Công Sở & Ngữ Pháp 〜に関して",
    description: "Làm chủ cách báo cáo tiến độ, trao đổi công việc chuyên nghiệp và sử dụng cấu trúc liên quan.",
    level: "N3",
    order: 0,
    xpReward: 50,
    exercises: [
      {
        type: "MULTIPLE_CHOICE",
        question: "Cụm từ 'Liên quan đến dự án mới' được dịch sang tiếng Nhật chuẩn là:",
        correctAnswer: "新規プロジェクトに関して",
        points: 10,
        options: [
          { text: "新規プロジェクトに関して", isCorrect: true },
          { text: "新規プロジェクトにとって", isCorrect: false },
          { text: "新規プロジェクトによって", isCorrect: false },
          { text: "新規プロジェクトをとおして", isCorrect: false },
        ],
      },
    ],
  },
  {
    slug: "n3-lesson-02-certainty",
    title: "Bài 02 (N3): Khẳng Định Logic 〜わけがない & 〜に違いない",
    description: "Phân tích và diễn đạt các suy luận logic, phủ định đanh thép và phán đoán chắc chắn.",
    level: "N3",
    order: 1,
    xpReward: 50,
    exercises: [
      {
        type: "MULTIPLE_CHOICE",
        question: "Chọn câu mang ý nghĩa 'Tuyệt đối không thể nào có chuyện anh ấy lừa dối':",
        correctAnswer: "彼が嘘をつくわけがありません。",
        points: 10,
        options: [
          { text: "彼が嘘をつくわけがありません。", isCorrect: true },
          { text: "彼が嘘をつくかもしれません。", isCorrect: false },
          { text: "彼が嘘をつくはずです。", isCorrect: false },
          { text: "彼が嘘をつくそうです。", isCorrect: false },
        ],
      },
    ],
  },
  {
    slug: "n3-lesson-03-timing",
    title: "Bài 03 (N3): Thời Điểm Vàng — 〜たとたん & 〜うちに",
    description: "Nắm bắt các khoảnh khắc vàng trong diễn đạt: vừa mới xảy ra thì bất ngờ ập đến, và tranh thủ thời gian.",
    level: "N3",
    order: 2,
    xpReward: 50,
    exercises: [
      {
        type: "MULTIPLE_CHOICE",
        question: "Để khuyên ai đó 'Hãy ăn bánh nhân lúc còn nóng', ta dùng mẫu câu nào?",
        correctAnswer: "熱いうちに食べてください。",
        points: 10,
        options: [
          { text: "熱いうちに食べてください。", isCorrect: true },
          { text: "熱いたとたんに食べてください。", isCorrect: false },
          { text: "熱いわけがないです。", isCorrect: false },
          { text: "熱いに関して食べてください。", isCorrect: false },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// JLPT N3 SCENARIOS (SURVIVAL MODE)
// ─────────────────────────────────────────────────────────────────────────────
export const SCENARIOS_N3 = [
  {
    slug: "n3-workplace-reporting",
    title: "Báo Cáo Tiến Độ Dự Án Với Quản Lý Nhật Bản (Horenso)",
    description: "Thực hành văn hóa Horenso (Báo cáo - Liên lạc - Thảo luận) chuẩn mực với Trưởng phòng Yamada.",
    level: "N3",
    xpReward: 60,
    messages: [
      {
        order: 1,
        speaker: "山田部長 (Trưởng phòng Yamada)",
        japanese: "ナムさん、来週のプレゼン資料の進捗状況はどうなっていますか？",
        romaji: "Namu-san, raishū no purezen shiryō no shinchoku jōkyō wa dō natte imasu ka?",
        meaning: "Nam ơi, tình hình tiến độ tài liệu thuyết trình cho tuần sau đến đâu rồi em?",
      },
      {
        order: 2,
        speaker: "Bạn (Học viên)",
        japanese: "部長、お疲れ様です。資料のドラフトは8割方完成しており、本日中にご確認いただける予定です。",
        romaji: "Buchō, otsukaresama desu. Shiryō no dorafuto wa hachiwarigata kansei shite ori, honjitsuchū ni go-kaknin itadakeru yotei desu.",
        meaning: "Dạ em chào Trưởng phòng ạ. Bản thảo tài liệu đã hoàn thành được khoảng 80%, dự kiến trong ngày hôm nay em sẽ gửi để Trưởng phòng duyệt qua ạ.",
      },
    ],
    choices: [
      {
        optionText: "何か修正点がございましたら、遠慮なくご指摘ください。",
        isIdeal: true,
        xpReward: 40,
      },
      {
        optionText: "自分で全部完璧にしたので直す必要はありません。",
        isIdeal: false,
        xpReward: 5,
      },
    ],
  },
  {
    slug: "n3-medical-clinic",
    title: "Khám Bệnh Tại Phòng Khám Đa Khoa Nhật Bản",
    description: "Mô tả chi tiết triệu chứng sức khỏe, tiền sử dị ứng và lắng nghe chỉ dẫn dùng thuốc của bác sĩ.",
    level: "N3",
    xpReward: 60,
    messages: [
      {
        order: 1,
        speaker: "医師 (Bác sĩ)",
        japanese: "今日はどのような症状でいらっしゃいましたか？",
        romaji: "Kyō wa dono yō na shōjō de irasshaimashita ka?",
        meaning: "Hôm nay bạn thấy trong người có triệu chứng gì bất thường thế?",
      },
      {
        order: 2,
        speaker: "Bạn (Học viên)",
        japanese: "一昨日から喉が痛くて、昨夜から38度の熱が出てしまいました。",
        romaji: "Ototoi kara nodo ga itakute, yūbe kara sanjūhachi-do no netsu ga dete shimaimashita.",
        meaning: "Từ hôm kia cổ họng tôi bị đau rát, và từ tối qua thì bị sốt lên tới 38 độ ạ.",
      },
    ],
    choices: [
      {
        optionText: "薬のアレルギーは特にありません。よろしくお願いいたします。",
        isIdeal: true,
        xpReward: 40,
      },
      {
        optionText: "注射は嫌いなので薬だけたくさんください。",
        isIdeal: false,
        xpReward: 5,
      },
    ],
  },
];
