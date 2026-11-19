// THE TEST SCENARIO: edit this one file to change who is in the demo. Nothing else needs to change.
//
// PEOPLE  one row per person.
//   id     any unique short text
//   pernr  the personnel number (PERNR, 8 digits) of the person in ECC. The values below are PLACEHOLDERS starting with 9: replace each with the real number.
//   lv     their level: "dg" (Director General), "ed" (Executive Director), "dir" (Director), "mgr" (Manager), "sh" (Section head), "emp" (Employee)
//   label  how the person appears everywhere (dropdown, goals, approvals). Keep it unique.
//   boss   the id of the person they report to (their approver). The DG has none.
//   note   (optional) one line shown when someone picks who to push a goal down to.
// The cascade is DG > ED > Director > Manager > Section head > Employee. Everyone, at every level, can create goals.
//
// Goals start empty. The DG creates the top goals, each person below links theirs to a goal of the person above, and a
// goal can be pushed down to direct reports. Goals are approved by the person above (the DG's need no approval).
sap.ui.define([], function () {
	var PEOPLE = [
		{ id: "dg", pernr: "90000001", lv: "dg", label: "Layla Mansour, Director General", boss: null },

		{ id: "ed1", pernr: "90000002", lv: "ed", label: "Omar Saleh, ED Digital", boss: "dg" },
		{ id: "ed2", pernr: "90000003", lv: "ed", label: "Rana Haddad, ED News", boss: "dg" },
		{ id: "ed3", pernr: "90000004", lv: "ed", label: "Khalid Nasser, ED Arabic", boss: "dg" },

		{ id: "d1", pernr: "90000005", lv: "dir", label: "Director, Digital", boss: "ed1" },
		{ id: "d2", pernr: "90000006", lv: "dir", label: "Director, Video", boss: "ed1" },
		{ id: "d3", pernr: "90000007", lv: "dir", label: "Director, Web", boss: "ed1" },
		{ id: "d4", pernr: "90000008", lv: "dir", label: "Director, Social", boss: "ed1" },
		{ id: "d5", pernr: "90000009", lv: "dir", label: "Director, Newsroom", boss: "ed2" },
		{ id: "d6", pernr: "90000010", lv: "dir", label: "Director, Arabic Desk", boss: "ed3" },

		{ id: "m1", pernr: "90000011", lv: "mgr", label: "Manager, Web desk", boss: "d1", note: "2 staff. Runs the publishing desk this goal depends on." },
		{ id: "m2", pernr: "90000012", lv: "mgr", label: "Manager, Mobile", boss: "d1", note: "3 staff. Owns the apps." },
		{ id: "m3", pernr: "90000013", lv: "mgr", label: "Manager, Audience", boss: "d1", note: "2 staff. Little overlap with this goal so far." },
		{ id: "m4", pernr: "90000014", lv: "mgr", label: "Manager, Video desk", boss: "d2", note: "3 staff. Produces and publishes video." },
		{ id: "m5", pernr: "90000015", lv: "mgr", label: "Manager, CMS", boss: "d3", note: "2 staff. Runs the publishing system." },
		{ id: "m6", pernr: "90000016", lv: "mgr", label: "Manager, Social desk", boss: "d4", note: "3 staff. Runs the social accounts." },
		{ id: "m7", pernr: "90000017", lv: "mgr", label: "Manager, Newsroom", boss: "d5", note: "4 staff. Runs the daily news desk." },
		{ id: "m8", pernr: "90000018", lv: "mgr", label: "Manager, Arabic desk", boss: "d6", note: "3 staff. Runs Arabic editing." },

		{ id: "sh1", pernr: "90000019", lv: "sh", label: "Section head, Publishing", boss: "m1", note: "Leads the publishing section: 3 staff." },
		{ id: "sh2", pernr: "90000020", lv: "sh", label: "Section head, Apps", boss: "m2", note: "Leads the apps section: 2 staff." },
		{ id: "sh3", pernr: "90000021", lv: "sh", label: "Section head, Audience", boss: "m3", note: "Leads the audience section: 1 staff." },
		{ id: "sh4", pernr: "90000022", lv: "sh", label: "Section head, Video edit", boss: "m4", note: "Leads video editing: 2 staff." },
		{ id: "sh5", pernr: "90000023", lv: "sh", label: "Section head, CMS", boss: "m5", note: "Leads CMS support: 1 staff." },
		{ id: "sh6", pernr: "90000024", lv: "sh", label: "Section head, Social", boss: "m6", note: "Leads the social section: 1 staff." },
		{ id: "sh7", pernr: "90000025", lv: "sh", label: "Section head, Newsroom", boss: "m7", note: "Leads the day shift: 1 staff." },
		{ id: "sh8", pernr: "90000026", lv: "sh", label: "Section head, Arabic editing", boss: "m8", note: "Leads Arabic editing: 1 staff." },

		{ id: "e1", pernr: "90000027", lv: "emp", label: "Sara Khan", boss: "sh1" },
		{ id: "e2", pernr: "90000028", lv: "emp", label: "Ali Reza", boss: "sh1" },
		{ id: "e3", pernr: "90000029", lv: "emp", label: "Noor Hassan", boss: "sh1" },
		{ id: "e4", pernr: "90000030", lv: "emp", label: "Lina Abbas", boss: "sh3" },
		{ id: "e5", pernr: "90000031", lv: "emp", label: "Yousef Amin", boss: "sh2" },
		{ id: "e6", pernr: "90000032", lv: "emp", label: "Dana Haddad", boss: "sh2" },
		{ id: "e7", pernr: "90000033", lv: "emp", label: "Mariam Zaki", boss: "sh4" },
		{ id: "e8", pernr: "90000034", lv: "emp", label: "Tariq Younes", boss: "sh4" },
		{ id: "e9", pernr: "90000035", lv: "emp", label: "Salma Farouk", boss: "sh5" },
		{ id: "e10", pernr: "90000036", lv: "emp", label: "Rami Odeh", boss: "sh6" },
		{ id: "e11", pernr: "90000037", lv: "emp", label: "Huda Salim", boss: "sh7" },
		{ id: "e12", pernr: "90000038", lv: "emp", label: "Fadi Karam", boss: "sh8" }
	];

	// No goals are preloaded: everyone starts with an empty slate, and goals are created on the screens.
	var GOALS = {};

	return { PEOPLE: PEOPLE, GOALS: GOALS };
});
