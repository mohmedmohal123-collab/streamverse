import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Language } from "../types";

const translations = {
  en: {
    // Nav
    home: "Home",
    search: "Search",
    history: "History",
    profile: "Profile",
    admin: "Admin",
    settings: "Settings",
    create: "Create",
    notifications: "Notifications",
    // Home
    trending: "Trending",
    mostWatched: "Most Watched",
    recentlyWatched: "Recently Watched",
    forYou: "For You",
    recommendations: "Recommendations",
    // Search
    searchPlaceholder: "Search videos, music, movies...",
    searchResults: "Search Results",
    noResults: "No results found",
    noResultsHint: "Try different keywords or check your spelling",
    aiAssistant: "AI Assistant",
    aiPlaceholder: "Ask me anything about what you want to watch...",
    refineSearch: "Refine my search",
    suggestions: "Suggestions",
    // Source filters
    "search.filter.all": "All",
    "search.filter.youtube": "YouTube",
    "search.filter.vimeo": "Vimeo",
    // Video
    watch: "Watch",
    download: "Download",
    share: "Share",
    views: "views",
    duration: "Duration",
    channel: "Channel",
    publishedAt: "Published",
    // Auth
    login: "Sign In",
    register: "Sign Up",
    logout: "Sign Out",
    loginWithII: "Sign in with Internet Identity",
    loginWithGoogle: "Sign in with Google",
    username: "Username",
    password: "Password",
    confirmPassword: "Confirm Password",
    email: "Email",
    "login.tab.signin": "Sign In",
    "login.tab.register": "Sign Up",
    "login.username.placeholder": "Enter your username",
    "login.password.placeholder": "Enter your password",
    "login.orDivider": "OR",
    "login.noAccount": "Don't have an account?",
    "login.haveAccount": "Already have an account?",
    "login.error.wrongPassword": "Wrong password. Please try again.",
    "login.error.userNotFound": "User not found. Please check your username.",
    "login.error.googleFailed": "Google sign-in failed. Please try again.",
    "login.error.networkError": "Network error. Please check your connection.",
    "login.error.passwordMismatch": "Passwords do not match.",
    "login.error.weakPassword": "Password must be at least 8 characters.",
    "login.error.usernameRequired": "Username is required.",
    "login.error.passwordRequired": "Password is required.",
    "login.error.emailRequired": "Email is required.",
    "login.error.emailInvalid": "Please enter a valid email address.",
    "register.usernameHint": "3–20 characters: letters, numbers, or _",
    // Profile
    editProfile: "Edit Profile",
    changePassword: "Change Password",
    language: "Language",
    theme: "Theme",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    "profile.facebook": "Facebook",
    "profile.tiktok": "TikTok",
    // Admin
    dashboard: "Dashboard",
    users: "Users",
    statistics: "Statistics",
    apiKeys: "API Keys",
    platformSettings: "Platform Settings",
    contentModeration: "Content Moderation",
    totalUsers: "Total Users",
    totalWatches: "Total Watches",
    bannedUsers: "Banned Users",
    "admin.vimeoApiKey": "Vimeo API Key",
    // History
    watchHistory: "Watch History",
    clearHistory: "Clear History",
    noHistory: "No watch history yet",
    noHistoryHint: "Videos you watch will appear here",
    // Notifications
    "notifications.title": "Notifications",
    "notifications.markAllRead": "Mark all as read",
    "notifications.empty": "No notifications yet",
    "notifications.emptyHint":
      "When someone follows you or interacts with your videos, you'll see it here.",
    "notifications.new_follower": "started following you",
    "notifications.video_liked": "liked your video",
    "notifications.video_commented": "commented on your video",
    "notifications.new_video_from_followed": "posted a new video",
    "notifications.justNow": "Just now",
    "notifications.minutesAgo": "m ago",
    "notifications.hoursAgo": "h ago",
    "notifications.daysAgo": "d ago",
    // Subscription
    "subscribe.title": "Upgrade Your Plan",
    "subscribe.subtitle":
      "Unlock premium features with a StreamVerse subscription",
    "subscribe.currentPlan": "Current Plan",
    "subscribe.upgrade": "Upgrade",
    "subscribe.cancel": "Cancel Subscription",
    "subscribe.free.name": "Free",
    "subscribe.free.price": "$0",
    "subscribe.free.period": "/month",
    "subscribe.free.desc": "Get started for free",
    "subscribe.plus.name": "Plus",
    "subscribe.plus.price": "$4.99",
    "subscribe.plus.period": "/month",
    "subscribe.plus.desc": "Best for regular viewers",
    "subscribe.pro.name": "Pro",
    "subscribe.pro.price": "$9.99",
    "subscribe.pro.period": "/month",
    "subscribe.pro.desc": "For power users & creators",
    "subscribe.featured": "Best Value",
    "subscribe.processing": "Processing...",
    "subscribe.success": "Successfully subscribed!",
    "subscribe.managePayment": "Manage Payment Method",
    "subscribe.managePaymentHint":
      "Update card, view invoices, or change billing details",
    "subscribe.openingPortal": "Opening Portal...",
    "subscribe.status.active": "Active",
    "subscribe.status.canceled": "Canceled",
    "subscribe.status.past_due": "Past Due",
    "subscribe.status.none": "None",
    "subscribe.nextBilling": "Next billing date",
    "subscribe.cancelConfirmTitle": "Cancel Subscription?",
    "subscribe.cancelConfirmDesc":
      "Your subscription will remain active until the end of the current billing period.",
    "subscribe.cancelConfirm": "Yes, Cancel",
    "subscribe.cancelAbort": "Keep Subscription",
    "subscribe.free.f1": "Search & Watch",
    "subscribe.free.f2": "Watch History",
    "subscribe.free.f3": "Basic Quality",
    "subscribe.plus.f1": "All Free features",
    "subscribe.plus.f2": "HD Quality",
    "subscribe.plus.f3": "No Ads",
    "subscribe.plus.f4": "Download Videos",
    "subscribe.pro.f1": "All Plus features",
    "subscribe.pro.f2": "4K Quality",
    "subscribe.pro.f3": "Early Access",
    "subscribe.pro.f4": "Priority Support",
    "subscribe.pro.f5": "Creator Analytics",
    // Download
    "download.youtube.toast":
      "Opening YouTube — tap the 3-dot menu then Download",
    "download.vimeo.toast":
      "Opening Vimeo — tap the Download button on the page",
    "download.preparing": "Preparing download...",
    "download.success": "Downloaded successfully!",
    "download.failed": "Download failed. Please try again.",
    // Misc
    loading: "Loading...",
    error: "Something went wrong",
    retry: "Retry",
    cancel: "Cancel",
    save: "Save",
    confirm: "Confirm",
    delete: "Delete",
    back: "Back",
    close: "Close",
    youtube: "YouTube",
    vimeo: "Vimeo",
    streamverse: "StreamVerse",
    tagline: "Discover. Watch. Explore.",
    banUser: "Ban User",
    unbanUser: "Unban User",
    manageUsers: "Manage Users",
    apiKeyPlaceholder: "Enter YouTube API Key...",
    vimeoApiKeyPlaceholder: "Enter Vimeo API Key...",
    saveApiKey: "Save API Key",
    searchRefineTitle: "Refine your search with AI",
    searchRefineHint: "Describe what you want to watch",
    // Welcome screen
    "welcome.tagline": "Discover. Watch. Explore.",
    "welcome.subtitle":
      "Your bilingual video platform for YouTube and Vimeo — search millions of videos in Arabic and English.",
    "welcome.getStarted": "Get Started",
    "welcome.login": "Sign In",
    "welcome.features.search": "Smart AI Search",
    "welcome.features.trending": "Trending Videos",
    "welcome.features.bilingual": "Arabic & English",
    // Admin credentials
    adminCredentialsHint: "To login as admin, use the credentials above",
    // Voice & Audio search
    "search.voice.start": "Search by voice",
    "search.voice.listening": "Listening...",
    "search.voice.error": "Voice recognition failed, try again",
    "search.voice.unsupported": "Voice search not supported on this browser",
    "search.audio.start": "Search by playing a song",
    "search.audio.recording": "Listening to audio...",
    "search.audio.identifying": "Identifying audio...",
    "search.audio.matched": "Found: ",
    "search.audio.noMatch": "Could not identify audio, try again",
    "search.audio.error": "Audio capture failed, check microphone permissions",
    "search.audio.unsupported": "Audio search not supported on this browser",
    // Playlists
    playlists: "Playlists",
    "playlists.title": "My Playlists",
    "playlists.create": "New Playlist",
    "playlists.empty": "No playlists yet",
    "playlists.emptyHint":
      "Create your first playlist to organize your favorite videos",
    "playlists.addToPlaylist": "Add to Playlist",
    "playlists.added": "Added to playlist",
    "playlists.removed": "Removed from playlist",
    "playlists.createNew": "+ Create new playlist",
    "playlists.noPlaylists": "No playlists yet \u2014 create one!",
    // API key testing (en)
    "apitest.testButton": "Test",
    "apitest.testing": "Testing...",
    "apitest.valid": "Valid ✓",
    "apitest.invalid": "Error ✗",
    "apitest.formatOk": "Format OK ✓",
    "apitest.formatBad": "Bad Format ✗",
    "apitest.lastChecked": "Last checked:",
    "apitest.minutesAgo": "min ago",
    "apitest.hoursAgo": "h ago",
    "apitest.justNow": "just now",
    "apitest.stripeNote":
      "Stripe publishable key format validated (secret key cannot be tested from browser)",
    "apitest.corsNote":
      "Test completed — if CORS blocked the check, ensure your key is correct",
    // Offline
    offline: "Offline",
    "offline.saved": "Saved Offline",
    "offline.save": "Save for Offline",
    "offline.remove": "Remove from Offline",
    "offline.empty": "No Saved Videos",
    "offline.emptyHint":
      "Tap the cloud icon on any video to save it for offline viewing",
    "offline.savedToast": "Saved offline ✓",
    "offline.removedToast": "Removed from offline saves",
    "offline.streamingNote":
      "Saved videos keep metadata and thumbnails. Streaming still requires an internet connection.",
  },
  ar: {
    // Nav
    home: "الرئيسية",
    search: "استكشاف",
    history: "السجل",
    profile: "الملف الشخصي",
    admin: "الإدارة",
    settings: "الإعدادات",
    create: "إنشاء",
    notifications: "الإشعارات",
    // Home
    trending: "الأكثر رواجاً",
    mostWatched: "الأكثر مشاهدةً",
    recentlyWatched: "شاهدت مؤخراً",
    forYou: "مقترح لك",
    recommendations: "توصيات لك",
    // Search
    searchPlaceholder: "ابحث عن فيديوهات وموسيقى وأفلام...",
    searchResults: "نتائج البحث",
    noResults: "لا توجد نتائج",
    noResultsHint: "جرّب كلمات مختلفة أو تحقق من الإملاء",
    aiAssistant: "مساعد الذكاء الاصطناعي",
    aiPlaceholder: "اسألني عن أي محتوى تريد مشاهدته...",
    refineSearch: "تحسين البحث",
    suggestions: "اقتراحات",
    // Source filters
    "search.filter.all": "الكل",
    "search.filter.youtube": "يوتيوب",
    "search.filter.vimeo": "فيميو",
    // Video
    watch: "شاهد",
    download: "تحميل",
    share: "مشاركة",
    views: "مشاهدة",
    duration: "المدة",
    channel: "القناة",
    publishedAt: "نُشر",
    // Auth
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    logout: "تسجيل الخروج",
    loginWithII: "الدخول بـ Internet Identity",
    loginWithGoogle: "الدخول بـ Google",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    email: "البريد الإلكتروني",
    "login.tab.signin": "تسجيل الدخول",
    "login.tab.register": "إنشاء حساب",
    "login.username.placeholder": "أدخل اسم المستخدم",
    "login.password.placeholder": "أدخل كلمة المرور",
    "login.orDivider": "أو",
    "login.noAccount": "ليس لديك حساب؟",
    "login.haveAccount": "لديك حساب بالفعل؟",
    "login.error.wrongPassword": "كلمة المرور خاطئة. حاول مرة أخرى.",
    "login.error.userNotFound": "المستخدم غير موجود. تحقق من اسم المستخدم.",
    "login.error.googleFailed": "فشل تسجيل الدخول بـ Google. حاول مرة أخرى.",
    "login.error.networkError": "خطأ في الشبكة. تحقق من الاتصال.",
    "login.error.passwordMismatch": "كلمتا المرور غير متطابقتين.",
    "login.error.weakPassword": "يجب أن تكون كلمة المرور 8 أحرف على الأقل.",
    "login.error.usernameRequired": "اسم المستخدم مطلوب.",
    "login.error.passwordRequired": "كلمة المرور مطلوبة.",
    "login.error.emailRequired": "البريد الإلكتروني مطلوب.",
    "login.error.emailInvalid": "أدخل بريداً إلكترونياً صحيحاً.",
    "register.usernameHint": "3-20 حرف: أحرف، أرقام، أو _",
    // Profile
    editProfile: "تعديل الملف",
    changePassword: "تغيير كلمة المرور",
    language: "اللغة",
    theme: "الثيم",
    darkMode: "الوضع المظلم",
    lightMode: "الوضع الفاتح",
    "profile.facebook": "فيسبوك",
    "profile.tiktok": "تيك توك",
    // Admin
    dashboard: "لوحة التحكم",
    users: "المستخدمون",
    statistics: "الإحصائيات",
    apiKeys: "مفاتيح API",
    platformSettings: "إعدادات المنصة",
    contentModeration: "مراقبة المحتوى",
    totalUsers: "إجمالي المستخدمين",
    totalWatches: "إجمالي المشاهدات",
    bannedUsers: "المحظورون",
    "admin.vimeoApiKey": "مفتاح Vimeo API",
    // History
    watchHistory: "سجل المشاهدة",
    clearHistory: "مسح السجل",
    noHistory: "لا يوجد سجل مشاهدة",
    noHistoryHint: "ستظهر الفيديوهات التي شاهدتها هنا",
    // Notifications
    "notifications.title": "الإشعارات",
    "notifications.markAllRead": "تحديد الكل كمقروء",
    "notifications.empty": "لا توجد إشعارات بعد",
    "notifications.emptyHint":
      "عندما يتابعك شخص ما أو يتفاعل مع فيديوهاتك، ستراه هنا.",
    "notifications.new_follower": "بدأ بمتابعتك",
    "notifications.video_liked": "أعجب بفيديوك",
    "notifications.video_commented": "علّق على فيديوك",
    "notifications.new_video_from_followed": "نشر فيديو جديد",
    "notifications.justNow": "الآن",
    "notifications.minutesAgo": "د",
    "notifications.hoursAgo": "س",
    "notifications.daysAgo": "ي",
    // Subscription
    "subscribe.title": "ترقية خطتك",
    "subscribe.subtitle": "افتح مميزات متميزة مع اشتراك StreamVerse",
    "subscribe.currentPlan": "الخطة الحالية",
    "subscribe.upgrade": "ترقية",
    "subscribe.cancel": "إلغاء الاشتراك",
    "subscribe.free.name": "مجاني",
    "subscribe.free.price": "$0",
    "subscribe.free.period": "/شهر",
    "subscribe.free.desc": "ابدأ مجاناً",
    "subscribe.plus.name": "بلس",
    "subscribe.plus.price": "$4.99",
    "subscribe.plus.period": "/شهر",
    "subscribe.plus.desc": "الأفضل للمشاهدين المنتظمين",
    "subscribe.pro.name": "برو",
    "subscribe.pro.price": "$9.99",
    "subscribe.pro.period": "/شهر",
    "subscribe.pro.desc": "للمستخدمين المتقدمين والمنشئين",
    "subscribe.featured": "الأفضل قيمة",
    "subscribe.processing": "جارٍ المعالجة...",
    "subscribe.success": "تم الاشتراك بنجاح!",
    "subscribe.managePayment": "إدارة طريقة الدفع",
    "subscribe.managePaymentHint":
      "تحديث البطاقة أو عرض الفواتير أو تغيير معلومات الفوترة",
    "subscribe.openingPortal": "جارٍ الفتح...",
    "subscribe.status.active": "نشط",
    "subscribe.status.canceled": "ملغى",
    "subscribe.status.past_due": "متأخر السداد",
    "subscribe.status.none": "بدون اشتراك",
    "subscribe.nextBilling": "تاريخ الفاتورة التالية",
    "subscribe.cancelConfirmTitle": "إلغاء الاشتراك؟",
    "subscribe.cancelConfirmDesc":
      "سيظل اشتراكك نشطاً حتى نهاية دورة الفوترة الحالية.",
    "subscribe.cancelConfirm": "نعم، إلغاء",
    "subscribe.cancelAbort": "الاحتفاظ بالاشتراك",
    "subscribe.free.f1": "بحث ومشاهدة",
    "subscribe.free.f2": "سجل المشاهدة",
    "subscribe.free.f3": "جودة أساسية",
    "subscribe.plus.f1": "كل مميزات المجاني",
    "subscribe.plus.f2": "جودة عالية HD",
    "subscribe.plus.f3": "بدون إعلانات",
    "subscribe.plus.f4": "تحميل الفيديوهات",
    "subscribe.pro.f1": "كل مميزات بلس",
    "subscribe.pro.f2": "جودة 4K",
    "subscribe.pro.f3": "وصول مبكر",
    "subscribe.pro.f4": "دعم أولوية",
    "subscribe.pro.f5": "تحليلات المنشئ",
    // Download
    "download.youtube.toast":
      "فتح يوتيوب — انقر على قائمة النقاط الثلاث ثم تحميل",
    "download.vimeo.toast": "فتح فيميو — انقر على زر التحميل في الصفحة",
    "download.preparing": "جارٍ التحضير للتحميل...",
    "download.success": "تم التحميل بنجاح!",
    "download.failed": "فشل التحميل. حاول مرة أخرى.",
    // Misc
    loading: "جارٍ التحميل...",
    retry: "إعادة المحاولة",
    cancel: "إلغاء",
    save: "حفظ",
    confirm: "تأكيد",
    delete: "حذف",
    back: "رجوع",
    close: "إغلاق",
    youtube: "يوتيوب",
    vimeo: "فيميو",
    streamverse: "StreamVerse",
    tagline: "اكتشف. شاهد. استكشف.",
    banUser: "حظر المستخدم",
    unbanUser: "إلغاء الحظر",
    manageUsers: "إدارة المستخدمين",
    apiKeyPlaceholder: "أدخل مفتاح YouTube API...",
    vimeoApiKeyPlaceholder: "أدخل مفتاح Vimeo API...",
    saveApiKey: "حفظ مفتاح API",
    searchRefineTitle: "حسّن بحثك بالذكاء الاصطناعي",
    searchRefineHint: "اصف ما تريد مشاهدته",
    // Welcome screen
    "welcome.tagline": "اكتشف. شاهد. استكشف.",
    "welcome.subtitle":
      "منصتك المزدوجة للفيديو من YouTube وVimeo — ابحث في ملايين الفيديوهات بالعربية والإنجليزية.",
    "welcome.getStarted": "ابدأ الآن",
    "welcome.login": "تسجيل الدخول",
    "welcome.features.search": "بحث ذكي بالذكاء الاصطناعي",
    "welcome.features.trending": "الفيديوهات الرائجة",
    "welcome.features.bilingual": "العربية والإنجليزية",
    // Admin credentials
    adminCredentialsHint: "للدخول كمسؤول، استخدم بيانات الاعتماد أعلاه",
    // Voice & Audio search
    "search.voice.start": "بحث صوتي",
    "search.voice.listening": "جارٍ الاستماع...",
    "search.voice.error": "فشل التعرف على الصوت، حاول مرة أخرى",
    "search.voice.unsupported": "البحث الصوتي غير مدعوم في هذا المتصفح",
    "search.audio.start": "بحث بتشغيل أغنية",
    "search.audio.recording": "جارٍ الاستماع للصوت...",
    "search.audio.identifying": "جارٍ التعرف على الصوت...",
    "search.audio.matched": "تم العثور على: ",
    "search.audio.noMatch": "لم يتم التعرف على الصوت، حاول مرة أخرى",
    "search.audio.error": "فشل التقاط الصوت، تحقق من صلاحيات الميكروفون",
    "search.audio.unsupported": "البحث بالصوت غير مدعوم في هذا المتصفح",
    // Playlists (ar)
    playlists:
      "\u0642\u0648\u0627\u0626\u0645 \u0627\u0644\u062a\u0634\u063a\u064a\u0644",
    "playlists.title":
      "\u0642\u0648\u0627\u0626\u0645 \u0627\u0644\u062a\u0634\u063a\u064a\u0644",
    "playlists.create":
      "\u0625\u0646\u0634\u0627\u0621 \u0642\u0627\u0626\u0645\u0629",
    "playlists.empty":
      "\u0644\u0627 \u062a\u0648\u062c\u062f \u0642\u0648\u0627\u0626\u0645 \u0628\u0639\u062f",
    "playlists.emptyHint":
      "\u0623\u0646\u0634\u0626 \u0642\u0627\u0626\u0645\u062a\u0643 \u0627\u0644\u0623\u0648\u0644\u0649 \u0644\u062a\u0646\u0638\u064a\u0645 \u0641\u064a\u062f\u064a\u0648\u0647\u0627\u062a\u0643 \u0627\u0644\u0645\u0641\u0636\u0644\u0629",
    "playlists.addToPlaylist":
      "\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0642\u0627\u0626\u0645\u0629",
    "playlists.added":
      "\u062a\u0645\u062a \u0627\u0644\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0627\u0644\u0642\u0627\u0626\u0645\u0629",
    "playlists.removed":
      "\u062a\u0645 \u0627\u0644\u062d\u0630\u0641 \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629",
    "playlists.createNew":
      "+ \u0625\u0646\u0634\u0627\u0621 \u0642\u0627\u0626\u0645\u0629 \u062c\u062f\u064a\u062f\u0629",
    "playlists.noPlaylists":
      "\u0644\u0627 \u062a\u0648\u062c\u062f \u0642\u0648\u0627\u0626\u0645 \u0628\u0639\u062f \u2014 \u0623\u0646\u0634\u0626 \u0642\u0627\u0626\u0645\u0629!",
    // API key testing (ar)
    "apitest.testButton": "\u0627\u062e\u062a\u0628\u0627\u0631",
    "apitest.testing": "جارٍ الفحص...",
    "apitest.valid": "صالح ✓",
    "apitest.invalid": "خطأ ✗",
    "apitest.formatOk": "تنسيق صحيح ✓",
    "apitest.formatBad": "تنسيق خاطئ ✗",
    "apitest.lastChecked": "آخر فحص:",
    "apitest.minutesAgo": "د مضت",
    "apitest.hoursAgo": "س مضت",
    "apitest.justNow": "الآن",
    "apitest.stripeNote":
      "تم التحقق من تنسيق المفتاح (لا يمكن اختبار المفتاح السري من المتصفح)",
    "apitest.corsNote": "اكتمل الفحص — إذا حدث خطأ CORS، تأكد من صحة المفتاح",
    // Offline
    offline: "غير متصل",
    "offline.saved": "محفوظ للاستخدام دون إنترنت",
    "offline.save": "حفظ للاستخدام دون إنترنت",
    "offline.remove": "إزالة من المحفوظات",
    "offline.empty": "لا توجد فيديوهات محفوظة",
    "offline.emptyHint":
      "اضغط على أيقونة السحابة في أي فيديو لحفظه للمشاهدة دون إنترنت",
    "offline.savedToast": "تم الحفظ للاستخدام دون إنترنت ✓",
    "offline.removedToast": "تم إزالة الفيديو من المحفوظات",
    "offline.streamingNote":
      "الفيديوهات المحفوظة تحتفظ بالبيانات والصور المصغرة. بث الفيديو يتطلب اتصال بالإنترنت.",
  },
} as const;

type TranslationKeys = keyof typeof translations.en;

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      language: "ar",
      setLanguage: (lang: Language) => {
        set({ language: lang });
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      },
      t: (key: TranslationKeys) => {
        const lang = get().language;
        return translations[lang][key] ?? translations.en[key] ?? key;
      },
    }),
    {
      name: "streamverse-language",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const lang = state.language;
          document.documentElement.lang = lang;
          document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        }
      },
    },
  ),
);

export const useTranslation = () => {
  const { t, language, setLanguage } = useI18n();
  return { t, language, setLanguage, isRTL: language === "ar" };
};
