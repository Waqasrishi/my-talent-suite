// The English / Arabic switch for the screen's own words (labels, buttons, hints, messages). It translates the text the app draws,
// from the lists below; goal titles, measures and anything a person types are never touched. Anything not listed stays in English.
// Arabic turns the whole page right to left. The choice is remembered in this browser.
sap.ui.define([], function () {
	const NAMES = { "Layla Mansour": "ليلى منصور", "Omar Saleh": "عمر صالح", "Rana Haddad": "رنا حداد", "Khalid Nasser": "خالد ناصر", "Sara Khan": "سارة خان", "Ali Reza": "علي رضا", "Noor Hassan": "نور حسن", "Lina Abbas": "لينا عباس", "Yousef Amin": "يوسف أمين", "Dana Haddad": "دانا حداد", "Mariam Zaki": "مريم زكي", "Tariq Younes": "طارق يونس", "Salma Farouk": "سلمى فاروق", "Rami Odeh": "رامي عودة", "Huda Salim": "هدى سالم", "Fadi Karam": "فادي كرم" };
	const AREAS = { "Digital": "الرقمي", "Video": "الفيديو", "Web": "الويب", "Social": "التواصل الاجتماعي", "Newsroom": "غرفة الأخبار", "Arabic Desk": "المكتب العربي", "Web desk": "الويب", "Mobile": "الهاتف المحمول", "Audience": "الجمهور", "Video desk": "الفيديو", "CMS": "نظام إدارة المحتوى", "Social desk": "التواصل الاجتماعي", "Arabic desk": "المكتب العربي", "News": "الأخبار", "Arabic": "العربية" };
	const MONTHS = { Jan: "يناير", January: "يناير", Feb: "فبراير", February: "فبراير", Mar: "مارس", March: "مارس", Apr: "أبريل", April: "أبريل", May: "مايو", Jun: "يونيو", June: "يونيو", Jul: "يوليو", July: "يوليو", Aug: "أغسطس", August: "أغسطس", Sep: "سبتمبر", September: "سبتمبر", Oct: "أكتوبر", October: "أكتوبر", Nov: "نوفمبر", November: "نوفمبر", Dec: "ديسمبر", December: "ديسمبر" };
	const LEVELS = { "Director General": "المدير العام", "DG": "المدير العام", "DG strategy": "استراتيجية المدير العام", "Executive Director": "المدير التنفيذي", "ED": "المدير التنفيذي", "Director": "مدير الإدارة", "Manager": "رئيس القسم", "Employee": "الموظف" };
	const LEVELS_PL = { "Director General": "المدير العام", "DG": "المدير العام", "DG strategy": "استراتيجية المدير العام", "Executive Director": "المديرين التنفيذيين", "ED": "المديرين التنفيذيين", "Director": "مديري الإدارات", "Manager": "رؤساء الأقسام", "Employee": "الموظفين" };

	// whole sentences and labels
	const D = {
		"Demo prototype. Sample data. The AI suggestions are simulated, not a live AI. Nothing is saved.": "نموذج تجريبي. بيانات تجريبية. اقتراحات الذكاء الاصطناعي محاكاة وليست ذكاءً اصطناعياً حقيقياً. لا يُحفظ أي شيء.",
		"Goals": "الأهداف", "Strategic goals": "الأهداف الاستراتيجية", "My goals": "أهدافي", "Viewing as": "العرض بصفة", "Alignment": "المواءمة", "Dashboard": "لوحة المتابعة", "Approvals": "الموافقات", "New goal": "هدف جديد", "Strategy": "الاستراتيجية",
		"You have no goals yet.": "ليس لديك أهداف بعد.", "Choose New goal to create one.": "اختر «هدف جديد» لإنشاء هدف.", "Suggested for you": "مقترح لك",
		"Based on the AJMN goal library. You decide.": "استناداً إلى مكتبة أهداف شبكة الجزيرة الإعلامية. القرار لك.", "Recommended": "موصى به", "A suggestion from the AJMN goal library.": "اقتراح من مكتبة أهداف شبكة الجزيرة الإعلامية.",
		"Write my own": "أكتب هدفي بنفسي", "Back": "رجوع", "Continue": "متابعة", "Cancel": "إلغاء", "Save and exit": "حفظ وخروج",
		"Suggestions come from the AI and are only suggestions. Nothing is saved until you submit.": "الاقتراحات من الذكاء الاصطناعي وهي مجرد اقتراحات. لا يُحفظ شيء حتى تقدّم الهدف.",
		"Suggestions come from the AI and are only suggestions. Nothing changes until you confirm.": "الاقتراحات من الذكاء الاصطناعي وهي مجرد اقتراحات. لا يتغير شيء حتى تؤكد.",
		"Suggestions come from the AI and are only suggestions. Nothing is saved until you push down.": "الاقتراحات من الذكاء الاصطناعي وهي مجرد اقتراحات. لا يُحفظ شيء حتى تسند الهدف.",
		"Goal": "الهدف", "Measure": "المقياس", "Due date": "تاريخ الاستحقاق", "Review": "المراجعة", "Role": "الدور", "Parent": "الهدف الأعلى", "Who": "من", "Wording": "الصياغة", "Date": "التاريخ",
		"What do you want to achieve?": "ماذا تريد أن تحقق؟", "Pick a suggestion, change it, or write your own.": "اختر اقتراحاً أو عدّله أو اكتب هدفك بنفسك.", "Your goal": "هدفك", "Based on your goal. You decide.": "استناداً إلى هدفك. القرار لك.",
		"How will you know this goal is done?": "كيف ستعرف أن هذا الهدف قد تحقق؟", "Matched to your measure.": "مطابق لمقياسك.", "End of Q2. Matches a 6-month measure.": "نهاية الربع الثاني. يناسب مقياساً لمدة 6 أشهر.", "End of Q3.": "نهاية الربع الثالث.", "End of Q1.": "نهاية الربع الأول.", "End of Q4.": "نهاية الربع الرابع.", "End of the goal year.": "نهاية سنة الأهداف.",
		"When should it be done?": "متى يجب إنجازه؟", "Goals usually end at a quarter end.": "تنتهي الأهداف عادةً في نهاية ربع سنوي.", "Change": "تغيير",
		"A quick quality check.": "فحص سريع للجودة.", "Measurable: the measure has a number": "قابل للقياس: المقياس يتضمن رقماً", "Not measurable: the measure has no number": "غير قابل للقياس: المقياس بلا رقم", "(passed)": "(ناجح)", "(check)": "(للمراجعة)", "Has a date": "له تاريخ", "Has a due date": "له تاريخ استحقاق", "No due date": "بلا تاريخ استحقاق",
		"Create goal": "إنشاء الهدف", "Check your goal before you submit": "راجع هدفك قبل التقديم", "You set the strategy, so this goal needs no approval. You can change any answer.": "أنت من يضع الاستراتيجية، لذا لا يحتاج هذا الهدف إلى موافقة. يمكنك تغيير أي إجابة.",
		"Goal created. As the Director General you set strategy, so it needs no approval.": "تم إنشاء الهدف. بصفتك المدير العام فأنت تضع الاستراتيجية، لذا لا يحتاج إلى موافقة.",
		"Approved": "معتمد", "Your progress": "تقدمك", "Open": "فتح", "Push down": "إسناد للفريق", "Push down a goal": "إسناد هدف للفريق", "Pushed down to you": "أُسند إليك", "On your plan": "ضمن خطتك", "Save progress": "حفظ التقدم", "Your own goals": "أهدافك الخاصة", "Contributing to:": "يساهم في:",
		"Your place in the cascade, one level up and one level down. Use the + buttons to open more levels, from the DG strategy down to the employee.": "موقعك في التسلسل، مستوى أعلى ومستوى أدنى. استخدم أزرار + لفتح مزيد من المستويات، من استراتيجية المدير العام إلى الموظف.",
		"Your place in the cascade.": "موقعك في التسلسل.", "you": "أنت", "Main link": "الارتباط الرئيسي", "Also supports": "يدعم أيضاً", "Your goals": "أهدافك", "Contributor link": "ارتباط المساهم", "Overall progress of the goal": "التقدم الإجمالي للهدف", "Show the full alignment chart": "إظهار مخطط المواءمة كاملاً",
		"Where your goals stand today. Updates as you create, submit and approve goals in this demo.": "موقف أهدافك اليوم. يتحدث مع إنشاء الأهداف وتقديمها واعتمادها في هذا النموذج.",
		"Live and tracked": "فعّال ويُتابع", "Awaiting approval": "بانتظار الموافقة", "With no one (you set strategy)": "لا أحد (أنت تضع الاستراتيجية)", "Returned": "مُعاد", "Needs your changes": "يحتاج إلى تعديلاتك", "Average progress": "متوسط التقدم", "Across your goals": "عبر أهدافك",
		"Progress by management goal": "التقدم حسب هدف الإدارة", "Average owner progress of your goals under each management goal.": "متوسط تقدم المالك لأهدافك تحت كل هدف إدارة.", "Needs attention": "يحتاج إلى انتباه", "Nothing needs attention.": "لا شيء يحتاج إلى انتباه.",
		"Nothing is waiting for you.": "لا شيء بانتظارك.", "All caught up. Goals your direct reports submit arrive here.": "لا شيء متأخر. الأهداف التي يقدمها مرؤوسوك المباشرون تصل إلى هنا.",
		"Set by": "وضعه", "Approver": "المعتمِد", "None (you set strategy)": "لا أحد (أنت تضع الاستراتيجية)", "Due": "الاستحقاق", "Progress": "التقدم", "Team progress": "تقدم الفريق", "Not pushed down": "لم يُسند للفريق", "Contributors": "المساهمون",
		"Edit goal": "تعديل الهدف", "You set the strategy, so you can edit every field.": "أنت تضع الاستراتيجية، لذا يمكنك تعديل كل الحقول.", "This goal is approved.": "هذا الهدف معتمد.",
		"This goal is not approved yet, so every field can be edited.": "هذا الهدف لم يُعتمد بعد، لذا يمكن تعديل كل الحقول.",
		"Goal title": "عنوان الهدف", "Description": "الوصف", "Proposed field": "حقل مقترح", "How you will know it is done (measure)": "كيف ستعرف أنه تحقق (المقياس)", "How you will know it is done": "كيف ستعرف أنه تحقق", "Target": "المستهدف", "Start date": "تاريخ البدء",
		"Supports (main link)": "يدعم (الارتباط الرئيسي)", "Supports": "يدعم", "Also supports (optional)": "يدعم أيضاً (اختياري)", "None": "لا شيء", "Your role on this goal": "دورك في هذا الهدف", "I own this goal": "أنا مالك هذا الهدف", "I contribute to someone else's goal": "أساهم في هدف شخص آخر", "This is a team goal": "هذا هدف فريق",
		"A goal has one owner. A contributor links to another owner's goal. A team goal is delivered by your managers.": "للهدف مالك واحد. المساهم يرتبط بهدف مالك آخر. هدف الفريق ينفّذه مديروك.",
		"Which goal are you contributing to?": "في أي هدف تساهم؟", "Which teams deliver it?": "أي الفرق تنفذه؟", "Discard changes": "تجاهل التغييرات", "Save changes": "حفظ التغييرات",
		"Add a status update": "إضافة تحديث للحالة", "Progress (%)": "التقدم (%)", "What changed?": "ما الذي تغيّر؟", "Save update": "حفظ التحديث", "No updates yet.": "لا توجد تحديثات بعد.", "Approval": "الموافقة", "Waiting for the approver.": "بانتظار المعتمِد.", "Where it sits": "موقعه", "no parent goal yet": "لا يوجد هدف أعلى بعد", "This goal": "هذا الهدف",
		"Add contributor": "إضافة مساهم", "Close": "إغلاق", "No contributors yet.": "لا يوجد مساهمون بعد.", "Invite": "دعوة", "Remove": "إزالة", "Owner": "المالك", "Contributor": "مساهم", "Who?": "من؟", "Their role on this goal": "دورهم في هذا الهدف",
		"A goal has exactly one owner: you. Contributors are other EDs or Directors who link their own goals to this one; a goal can have many. Whether a link needs approval is not decided yet (D-44).": "للهدف مالك واحد فقط: أنت. المساهمون هم مديرون تنفيذيون أو مديرو إدارات آخرون يربطون أهدافهم بهذا الهدف، وللهدف مساهمون عدة. لم يُحسم بعد ما إذا كان الارتباط يحتاج إلى موافقة (D-44).",
		"Quick check of this goal.": "فحص سريع لهذا الهدف.", "Not aligned to a management goal": "غير مرتبط بهدف إدارة", "Owner has room within 3 to 5 goals": "لدى المالك متسع ضمن 3 إلى 5 أهداف", "Owner would have more than 5 goals": "سيكون لدى المالك أكثر من 5 أهداف", "Activity": "النشاط",
		"Your team": "فريقك", "No goals to show yet.": "لا توجد أهداف لعرضها بعد.", "Create a goal, or ask the person above you to push one down to you.": "أنشئ هدفاً أو اطلب ممن فوقك أن يسند إليك هدفاً.", "Outside the 3 to 5 range": "خارج نطاق 3 إلى 5", "In range (3 to 5)": "ضمن النطاق (3 إلى 5)", "No goals yet": "لا توجد أهداف بعد",
		"You are the owner of most goals you create. You decide.": "أنت مالك معظم الأهداف التي تنشئها. القرار لك.", "You are the one owner and answer for it. It goes to your approver.": "أنت المالك الوحيد والمسؤول عنه. يُرفع إلى المعتمِد.", "You own it and push it to your managers, who deliver it. Their progress shows on your goal.": "أنت تملكه وتسنده إلى مديريك الذين ينفذونه. يظهر تقدمهم على هدفك.",
		"I am the owner": "أنا المالك", "I contribute": "أنا مساهم", "A team goal": "هدف فريق",
		"How are you involved in this goal?": "ما دورك في هذا الهدف؟", "Pick one. A goal has one owner. Contributors and teams help the owner.": "اختر واحداً. للهدف مالك واحد. يساعد المساهمون والفرق المالك.", "Based on the goals your manager has set. You decide.": "استناداً إلى الأهداف التي وضعها مديرك. القرار لك.",
		"Ranked by how well each fits your goal.": "مرتبة حسب مدى ملاءمتها لهدفك.", "Which management goal does this support?": "أي هدف إدارة يدعمه هذا الهدف؟", "The AI compared your goal and measure with the goals above you. Pick one main goal. You decide.": "قارن الذكاء الاصطناعي هدفك ومقياسك بالأهداف التي فوقك. اختر هدفاً رئيسياً واحداً. القرار لك.",
		"Which goal does this support?": "أي هدف يدعمه هذا الهدف؟", "Which team goal does this support?": "أي هدف فريق يدعمه هذا الهدف؟", "Where your goal will sit": "موقع هدفك", "Your role": "دورك", "Management goal": "هدف الإدارة", "Aligned to a management goal": "مرتبط بهدف إدارة", "Submit for approval": "تقديم للموافقة",
		"Everything below goes to your approver. You can change any answer.": "كل ما يلي يُرفع إلى المعتمِد. يمكنك تغيير أي إجابة.", "Owner: you": "المالك: أنت",
		"Reports to you.": "يتبع لك.", "You can pick people yourself in the real app. This demo lists teams only.": "في التطبيق الحقيقي يمكنك اختيار الأشخاص بنفسك. هذا النموذج يعرض الفرق فقط.",
		"Who should carry this goal?": "من يجب أن يحمل هذا الهدف؟", "Pick one or more teams. Goals go one level down.": "اختر فريقاً أو أكثر. تنتقل الأهداف مستوىً واحداً للأسفل.", "Based on how similar goals were pushed before.": "استناداً إلى كيفية إسناد أهداف مشابهة سابقاً.", "Based on who owns related goals. You decide.": "استناداً إلى من يملك أهدافاً ذات صلة. القرار لك.",
		"Same wording, each manager adds their own measure": "الصياغة نفسها، ويضيف كل مدير مقياسه", "Keeps the goal consistent across teams.": "يحافظ على اتساق الهدف بين الفرق.", "Each manager may reword it": "يمكن لكل مدير إعادة صياغته", "Use when teams work very differently.": "استخدمه عندما تختلف طبيعة عمل الفرق كثيراً.",
		"How should the goal be worded for them?": "كيف يجب أن يُصاغ الهدف لهم؟", "Choose how much each manager can change.": "اختر مقدار ما يمكن لكل مدير تغييره.", "Matched to your own due date.": "مطابق لتاريخ استحقاقك.", "Same as your goal.": "مثل هدفك.", "Earlier, to leave time to review.": "أبكر، لإتاحة وقت للمراجعة.",
		"When should they be done by?": "متى يجب أن ينجزوه؟", "Their date cannot be later than yours.": "لا يمكن أن يتأخر تاريخهم عن تاريخك.", "Going to": "يُسند إلى", "A quick check before it goes out.": "فحص سريع قبل الإرسال.", "Everyone you chose sits below you in the cascade": "كل من اخترتهم يقعون تحتك في التسلسل",
		"The goal has a due date": "للهدف تاريخ استحقاق", "No manager ends up over 5 goals": "لن يتجاوز أي مدير 5 أهداف", "Each manager gets this goal on their own goal plan. Their progress shows on your goal.": "يحصل كل مدير على هذا الهدف في خطة أهدافه. يظهر تقدمه على هدفك.", "Check before you push this down": "راجع قبل الإسناد",
		"Change awaiting approval": "تغيير بانتظار الموافقة", "Change request": "طلب تغيير", "From": "من", "Decision": "القرار", "Comment": "التعليق", "Requested change": "التغيير المطلوب", "Not set": "غير محدد", "Withdraw change request": "سحب طلب التغيير", "Request a change": "طلب تغيير",
		"What is your decision?": "ما قرارك؟", "You can change your mind on the review page.": "يمكنك تغيير رأيك في صفحة المراجعة.", "Drafted from the check. You decide.": "صيغ من الفحص. القرار لك.", "Check your decision before you confirm.": "راجع قرارك قبل التأكيد.", "Nothing changed.": "لم يتغير شيء.",
		"Read the goal and the AI check, then decide on the next page.": "اقرأ الهدف وفحص الذكاء الاصطناعي، ثم قرّر في الصفحة التالية.", "A quick check of the goal.": "فحص سريع للهدف.", "Draft not saved in this demo.": "لا تُحفظ المسودة في هذا النموذج.",
		"Add a title and a measure first.": "أضف عنواناً ومقياساً أولاً.", "Add the goal title and a measure first.": "أضف عنوان الهدف والمقياس أولاً.", "Pick at least one team, or choose another role.": "اختر فريقاً واحداً على الأقل أو اختر دوراً آخر.", "No changes to save.": "لا توجد تغييرات لحفظها.", "Saved.": "تم الحفظ.", "Update saved.": "تم حفظ التحديث.",
		"A goal can only have one owner.": "للهدف مالك واحد فقط.", "Change request withdrawn.": "تم سحب طلب التغيير.", "Progress must be a number from 0 to 100.": "يجب أن يكون التقدم رقماً من 0 إلى 100.", "Add one line on what changed.": "أضف سطراً واحداً عما تغيّر.",
		"Invited. Waiting for them to link one of their own goals.": "تمت الدعوة. بانتظار أن يربطوا أحد أهدافهم.", "Demo only: pretend they linked a goal": "للتجربة فقط: افترض أنهم ربطوا هدفاً", "Not allowed.": "غير مسموح.",
		"Strategy ": "الاستراتيجية ", "Everyone": "الجميع", "Team": "الفريق", "Not started": "لم يبدأ", "Received. Not started.": "تم الاستلام. لم يبدأ.",
		"Cut the time it takes to publish breaking stories": "تقليص الوقت اللازم لنشر الأخبار العاجلة", "Raise the share of stories with video from 30% to 50%": "رفع نسبة القصص المصحوبة بالفيديو من 30% إلى 50%", "Reduce corrections on published stories": "تقليل التصويبات على القصص المنشورة",
		"Contributors and teams": "المساهمون والفرق", "Not linked to a goal above": "غير مرتبط بهدف أعلى", "AJMN People home": "الصفحة الرئيسية لـ AJMN People", "Sections": "الأقسام", "ERP Workspace": "مساحة عمل ERP", "Sandbox workspace": "مساحة تجريبية", "Goals 2027": "أهداف 2027", "Menu": "القائمة", "Weight": "الوزن", "Weight (%)": "الوزن (%)", "Total weight": "إجمالي الأوزان", "Start": "البدء", "Not linked": "غير مرتبط", "Next end date": "أقرب تاريخ انتهاء", "Target 3 to 5": "المستهدف من 3 إلى 5", "No limit": "بلا حد", "No weights set yet": "لم تُحدد أوزان بعد", "Complete": "مكتمل", "Due today": "الاستحقاق اليوم", "Weight must be a number from 0 to 100.": "يجب أن يكون الوزن رقماً من 0 إلى 100.", "The weight says how much this goal counts towards your overall progress. The weights of all your goals should add up to 100%.": "يحدد الوزن مقدار مساهمة هذا الهدف في تقدمك الإجمالي. يجب أن يكون مجموع أوزان أهدافك 100%.", "Select a date": "اختر تاريخاً", "End date": "تاريخ الانتهاء", "Today": "اليوم", "Choose a date": "اختيار تاريخ", "Settings": "الإعدادات", "Public Profile": "الملف العام", "Proxy Now": "العمل بالإنابة الآن", "About": "حول", "Sign Out": "تسجيل الخروج", "Stop proxy": "إيقاف الإنابة", "Please enter target user name:": "الرجاء إدخال اسم المستخدم المستهدف:", "OK": "موافق", "Cancel": "إلغاء", "Admin Demo": "مشرف تجريبي", "Senior ERP Specialist": "أخصائي أول لنظام ERP", "Account navigation": "قائمة الحساب", "Clear": "مسح", "No matching users.": "لا يوجد مستخدمون مطابقون.", "AJMN Home": "AJMN الرئيسية", "My AI Assistant": "مساعدي الذكي", "My Requests": "طلباتي", "Areeba": "أريبا", "Open Ticket": "فتح تذكرة", "Search Employee": "بحث عن موظف", "Privacy Notice": "إشعار الخصوصية", "Home": "الرئيسية", "Your place in the cascade": "موقعك في التسلسل", "One line on what moved": "سطر واحد عما تغيّر", "One line": "سطر واحد", "Edit this suggestion directly": "عدّل هذا الاقتراح مباشرة", "Write my own goal": "أكتب هدفي بنفسي", "Show": "إظهار", "Hide": "إخفاء"
	};
	for (const k in LEVELS) { if (!D[k]) { D[k] = LEVELS[k]; } }

	const ar = (s) => /[؀-ۿ]/.test(s);
	const plural = (n, one, two, few, many) => n === 1 ? one : n === 2 ? two : (n >= 3 && n <= 10) ? n + " " + few : n + " " + many;
	const goals = (n) => n === 1 ? "هدف واحد" : n === 2 ? "هدفان" : plural(n, "", "", "أهداف", "هدفاً");
	const people = (n) => n === 1 ? "شخص واحد" : n === 2 ? "شخصان" : plural(n, "", "", "أشخاص", "شخصاً");
	const mgrs = (n) => n === 1 ? "رئيس قسم واحد" : n === 2 ? "رئيسا قسم" : plural(n, "", "", "رؤساء أقسام", "رئيس قسم");

	// text with names, roles and dates inside it
	function entities(s) {
		let t = s;
		t = t.replace(/\b(Director General|Executive Director)\b/g, (m) => LEVELS[m]);
		t = t.replace(/\bED (Digital|News|Arabic)\b/g, (m, a) => "المدير التنفيذي لل" + AREAS[a].slice(2));
		t = t.replace(/\b(Director|Manager), (Digital|Video desk|Video|Web desk|Web|Social desk|Social|Newsroom|Arabic Desk|Arabic desk|Mobile|Audience|CMS)\b/g, (m, l, a) => (l === "Director" ? "مدير إدارة " : "رئيس قسم ") + AREAS[a]);
		t = t.replace(/\b(Layla Mansour|Omar Saleh|Rana Haddad|Khalid Nasser|Sara Khan|Ali Reza|Noor Hassan|Lina Abbas|Yousef Amin|Dana Haddad|Mariam Zaki|Tariq Younes|Salma Farouk|Rami Odeh|Huda Salim|Fadi Karam)\b/g, (m) => NAMES[m]);
		t = t.replace(/\b(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4})\b/g, (m, d, mo, y) => d + " " + MONTHS[mo] + " " + y);
		t = t.replace(/([\u0600-\u06FF]), (?=[\u0600-\u06FF])/g, "$1، ");
		t = t.replace(/\(you\)/g, "(أنت)");
		t = t.replace(/\byou\b(?=,)/g, "أنت").replace(/^You,/, "أنت،");
		return t;
	}
	const lvl = (l, pl) => (pl ? LEVELS_PL : LEVELS)[l] || l;

	// sentences with a name, a number or a date in the middle
	const P = [
		[/^Goal year 2027\. You have (\d+) goals?(?: and (\d+) pushed down to you)?\.( The target is 3 to 5\.| There is no limit.*)?$/, (m, n, p, t) => "سنة الأهداف 2027. لديك " + goals(+n) + (p ? " و" + goals(+p) + " أُسندت إليك" : "") + "." + (t && /target/.test(t) ? " المستهدف من 3 إلى 5." : "")],
		[/^Your team \((\d+)\)$/, (m, n) => "فريقك (" + n + ")"],
		[/^(\d+) of 5$/, (m, n) => n + " من 5"],
		[/^You have room: (\d+) of 5 goals$/, (m, n) => "لديك متسع: " + n + " من 5 أهداف"],
		[/^(\d+)% \((\d+) goals?\)$/, (m, p, n) => p + "% (" + goals(+n) + ")"],
		[/^(\d+)% average$/, (m, p) => "متوسط " + p + "%"],
		[/^Team average (\d+)%\. How the owner.*$/, (m, p) => "متوسط الفريق " + p + "%. لم يُحسم بعد كيف تُجمع أرقام المالك والمساهم والفريق في رقم إجمالي واحد (D-44)."],
		[/^(.+) is not set up yet in this demo\.$/, (m, a) => tr(a) + " غير مُعدّ بعد في هذا النموذج."],
		[/^Progress set to (\d+)%$/, (m, n) => "تم ضبط التقدم على " + n + "%"],
		[/^(\d+) days left$/, (m, n) => n + " يوماً متبقياً"],
		[/^(\d+) days overdue$/, (m, n) => "متأخر " + n + " يوماً"],
		[/^(\d+)% still to give out$/, (m, n) => n + "% لم يُوزَّع بعد"],
		[/^(\d+)% over 100%$/, (m, n) => n + "% فوق 100%"],
		[/^(\d+) pushed down$/, (m, n) => "أُسند " + n],
		[/^Average (\d+)%$/, (m, n) => "المتوسط " + n + "%"],
		[/^Step (\d+) of (\d+)$/, (m, a, b) => "الخطوة " + a + " من " + b],
		[/^Step (\d+): (.+?)(?: \((current|done)\))?$/, (m, n, name, st) => "الخطوة " + n + ": " + tr(name) + (st ? (st === "current" ? " (الحالية)" : " (منجزة)") : "")],
		[/^Change (.+)$/, (m, a) => "تغيير " + tr(a)],
		[/^‹ (.+)$/, (m, a) => "‹ " + tr(a)],
		[/^\+ Show (.+?) goals (below|above)$/, (m, l, w) => "+ إظهار أهداف " + lvl(l, true) + (w === "below" ? " أدناه" : " أعلاه")],
		[/^(?:−|-|&minus;) Hide (.+?) level$/, (m, l) => "− إخفاء مستوى " + lvl(l, false)],
		[/^\+ Show (.+?) level$/, (m, l) => "+ إظهار مستوى " + lvl(l, false)],
		[/^Choose New goal to create one, or wait for (.+) to push one down to you\.$/, (m, w) => "اختر «هدف جديد» لإنشاء هدف، أو انتظر أن يسند إليك " + tr(w) + " هدفاً."],
		[/^With (.+)$/, (m, w) => "لدى " + tr(w)],
		[/^Submitted to (.+?), for approval\.$/, (m, w) => "تم التقديم إلى " + tr(w) + " للموافقة."],
		[/^Submitted for approval$/, () => "قُدّم للموافقة"],
		[/^Created$/, () => "أُنشئ"],
		[/^Approved\. ?(.*)$/, (m, r) => "تم الاعتماد. " + (r ? tr(r) : "")],
		[/^Returned to (.*)$/, (m, r) => "أُعيد إلى " + tr(r)],
		[/^Saved and resubmitted to (.*)$/, (m, r) => "تم الحفظ وإعادة التقديم إلى " + tr(r)],
		[/^Change sent to (.*)$/, (m, r) => "أُرسل التغيير إلى " + tr(r)],
		[/^Invited (.*)$/, (m, r) => "تمت دعوة " + tr(r)],
		[/^Removed (.*)$/, (m, r) => "تمت إزالة " + tr(r)],
		[/^Could support: (.+)\.$/, (m, g) => "قد يدعم: " + g + "."],
		[/^From (?!the AJMN)(.+?)(?: · (.+))?$/, (m, a, b) => "من " + tr(a) + (b ? " · " + tr(b) : "")],
		[/^Last update: (.+)$/, (m, a) => "آخر تحديث: " + tr(a)],
		[/^Supports: (.+)$/, (m, g) => "يدعم: " + tr(g)],
		[/^Owner: (.+)$/, (m, g) => "المالك: " + tr(g)],
		[/^Due (.+)$/, (m, d) => "الاستحقاق " + tr(d)],
		[/^Plan for: (.+)$/, (m, g) => "خطة: " + g],
		[/^Team: (.+)$/, (m, g) => "الفريق: " + tr(g)],
		[/^Pushed down to (\d+) (?:person|people)\. It is now on their goal plans\.$/, (m, n) => "أُسند إلى " + people(+n) + ". أصبح الآن ضمن خطط أهدافهم."],
		[/^Pushed down to (\d+): (.+)$/, (m, n, w) => "أُسند إلى " + n + ": " + tr(w)],
		[/^Pushed down to (.+?) · (.*)$/, (m, a, b) => "أُسند إلى " + tr(a) + " · " + tr(b)],
		[/^Team \((\d+) managers?, average\)$/, (m, n) => "الفريق (" + mgrs(+n) + "، المتوسط)"],
		[/^(\d+) managers? will receive this goal on their goal plan\.$/, (m, n) => "سيتلقى " + mgrs(+n) + " هذا الهدف في خطة أهدافه."],
		[/^(\d+) goals? waiting for your decision\.$/, (m, n) => (+n === 1 ? "هدف واحد بانتظار قرارك." : goals(+n) + " بانتظار قرارك.")],
		[/^(\d+) goals?$/, (m, n) => goals(+n)],
		[/^(Strong|Good|Possible|Weak) match(?: · (.*))?$/, (m, k, r) => ({ Strong: "تطابق قوي", Good: "تطابق جيد", Possible: "تطابق محتمل", Weak: "تطابق ضعيف" })[k] + (r ? " · " + tr(r).replace(/^Matches your words: /, "يطابق كلماتك: ") : "")],
		[/^Matches your words: (.+)$/, (m, w) => "يطابق كلماتك: " + w],
		[/^From the AJMN goal library · (.+)\.$/, (m, t) => "من مكتبة أهداف شبكة الجزيرة الإعلامية · " + t + "."],
		[/^Received\. Not started\. · (.+)$/, (m, d) => "تم الاستلام. لم يبدأ. · " + tr(d)],
		[/^Owner progress (\d+) percent$/, (m, n) => "تقدم المالك " + n + " بالمئة"],
		[/^Overall progress (\d+) percent$/, (m, n) => "التقدم الإجمالي " + n + " بالمئة"],
		[/^(.+): (\d+) percent$/, (m, a, n) => a + ": " + n + " بالمئة"],
		[/^(.+): no goals$/, (m, a) => a + ": لا أهداف"],
		[/^(.+) (\d+) percent$/, (m, a, n) => tr(a) + " " + n + " بالمئة"],
		[/^What should the (.+) change\?$/, (m, l) => "ما الذي يجب أن يغيّره " + lvl(l, false) + "؟"],
		[/^Your changes do not apply until (.+) approves them again\.$/, (m, w) => "لا تسري تغييراتك حتى يعتمدها " + tr(w) + " مجدداً."],
		[/^(.+) · (.+)$/, null]
	];

	function tr(s) {
		if (!s || ar(s)) { return s; }
		const core = s.trim();
		if (!/[A-Za-z]{2}/.test(core)) { return s; }
		const lead = s.slice(0, s.indexOf(core)), tail = s.slice(s.indexOf(core) + core.length);
		let out = null;
		if (D[core] !== undefined) { out = D[core]; }
		else {
			for (const [re, fn] of P) {
				if (!fn) { continue; }
				const m = core.match(re);
				if (m) { out = fn.apply(null, m); break; }
			}
			if (out === null && core.indexOf(" · ") > 0) { out = core.split(" · ").map(tr).join(" · "); }
			if (out === null) { out = entities(core); }
		}
		return out === core ? s : lead + out + tail;
	}

	function install(root) {
		const KEY = "ajmng-lang";
		let lang = "en";
		try { lang = localStorage.getItem(KEY) === "ar" ? "ar" : "en"; } catch (e) { /* storage may be blocked */ }
		const done = new Map(); // text node -> { en, ar }
		const ATTRS = ["aria-label", "placeholder", "title"];
		const skip = (n) => { const p = n.parentElement; return !p || p.closest("textarea,script,style,[data-i18n-skip]"); };
		function text(n) {
			if (skip(n)) { return; }
			const known = done.get(n);
			if (known && n.data === known.ar) { return; }
			const t = tr(n.data);
			if (t !== n.data) { done.set(n, { en: n.data, ar: t }); n.data = t; }
		}
		const adone = new Map(); // element -> { attribute: { en, ar } }
		function attrs(e) {
			ATTRS.forEach((a) => {
				const v = e.getAttribute && e.getAttribute(a);
				if (!v) { return; }
				const rec = (adone.get(e) || {})[a];
				if (rec && rec.ar === v) { return; }
				const t = tr(v);
				if (t !== v) { const o = adone.get(e) || {}; o[a] = { en: v, ar: t }; adone.set(e, o); e.setAttribute(a, t); }
			});
		}
		function walk(node) {
			if (node.nodeType === 3) { text(node); return; }
			if (node.nodeType !== 1) { return; }
			attrs(node);
			const w = document.createTreeWalker(node, NodeFilter.SHOW_ALL);
			let x = w.nextNode();
			while (x) { if (x.nodeType === 3) { text(x); } else if (x.nodeType === 1) { attrs(x); } x = w.nextNode(); }
		}
		function restore() {
			done.forEach((v, n) => { if (n.isConnected && n.data === v.ar) { n.data = v.en; } });
			done.clear();
			adone.forEach((o, e) => { for (const a in o) { if (e.getAttribute(a) === o[a].ar) { e.setAttribute(a, o[a].en); } } });
			adone.clear();
		}
		const mo = new MutationObserver((ms) => {
			if (lang !== "ar") { return; }
			mo.disconnect();
			ms.forEach((m) => {
				if (m.type === "childList") { m.addedNodes.forEach(walk); }
				else if (m.type === "characterData") { text(m.target); }
				else if (m.type === "attributes") { attrs(m.target); }
			});
			observe();
		});
		function observe() { mo.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS }); }
		function set(l, save) {
			lang = l;
			mo.disconnect();
			root.dir = l === "ar" ? "rtl" : "ltr";
			root.lang = l === "ar" ? "ar" : "en";
			root.classList.toggle("is-ar", l === "ar");
			if (l === "ar") { walk(root); } else { restore(); }
			const b = root.querySelector("#langBtn");
			if (b) { b.setAttribute("aria-pressed", String(l === "ar")); b.dataset.lang = l; }
			observe();
			if (save) { try { localStorage.setItem(KEY, l); } catch (e) { /* storage may be blocked */ } }
		}
		const btn = root.querySelector("#langBtn");
		if (btn) { btn.addEventListener("click", () => set(lang === "ar" ? "en" : "ar", true)); }
		set(lang, false);
		return { set, get: () => lang };
	}
	return { install, tr };
});
