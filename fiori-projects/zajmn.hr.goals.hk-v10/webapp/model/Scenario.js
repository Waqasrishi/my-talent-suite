// THE TEST SCENARIO: edit this one file to change who is in the demo. Nothing else needs to change.
//
// PEOPLE  one row per person.
//   id     any unique short text
//   lv     their level: "dg" (Director General), "ed" (Executive Director), "dir" (Director), "mgr" (Manager), "emp" (Employee)
//   label  how the person appears everywhere (dropdown, goals, approvals). Keep it unique.
//   boss   the id of the person they report to (their approver). The DG has none.
//   note   (optional) one line shown when someone picks who to push a goal down to.
// The cascade is DG > ED > Director > Manager > Employee. Everyone, at every level, can create goals.
//
// Goals start empty. The DG creates the top goals, each person below links theirs to a goal of the person above, and a
// goal can be pushed down to direct reports. Goals are approved by the person above (the DG's need no approval).
sap.ui.define([], function () {
	var PEOPLE = [
		{ id: "dg", lv: "dg", label: "Shk. Nasser Al-Thani, Director General", boss: null },

		{ id: "ed1", lv: "ed", label: "Omar Saleh, ED Digital", boss: "dg" },
		{ id: "ed2", lv: "ed", label: "Rana Haddad, ED News", boss: "dg" },
		{ id: "ed3", lv: "ed", label: "Khalid Nasser, ED Arabic", boss: "dg" },

		{ id: "d1", lv: "dir", label: "Director, Digital", boss: "ed1" },
		{ id: "d2", lv: "dir", label: "Director, Video", boss: "ed1" },
		{ id: "d3", lv: "dir", label: "Director, Web", boss: "ed1" },
		{ id: "d4", lv: "dir", label: "Director, Social", boss: "ed1" },
		{ id: "d5", lv: "dir", label: "Director, Newsroom", boss: "ed2" },
		{ id: "d6", lv: "dir", label: "Director, Arabic Desk", boss: "ed3" },

		{ id: "m1", lv: "mgr", label: "Manager, Web desk", boss: "d1", note: "2 staff. Runs the publishing desk this goal depends on." },
		{ id: "m2", lv: "mgr", label: "Manager, Mobile", boss: "d1", note: "3 staff. Owns the apps." },
		{ id: "m3", lv: "mgr", label: "Manager, Audience", boss: "d1", note: "2 staff. Little overlap with this goal so far." },
		{ id: "m4", lv: "mgr", label: "Manager, Video desk", boss: "d2", note: "3 staff. Produces and publishes video." },
		{ id: "m5", lv: "mgr", label: "Manager, CMS", boss: "d3", note: "2 staff. Runs the publishing system." },
		{ id: "m6", lv: "mgr", label: "Manager, Social desk", boss: "d4", note: "3 staff. Runs the social accounts." },
		{ id: "m7", lv: "mgr", label: "Manager, Newsroom", boss: "d5", note: "4 staff. Runs the daily news desk." },
		{ id: "m8", lv: "mgr", label: "Manager, Arabic desk", boss: "d6", note: "3 staff. Runs Arabic editing." },

		{ id: "e1", lv: "emp", label: "Sara Khan", boss: "m1" },
		{ id: "e2", lv: "emp", label: "Ali Reza", boss: "m1" },
		{ id: "e3", lv: "emp", label: "Noor Hassan", boss: "m1" },
		{ id: "e4", lv: "emp", label: "Lina Abbas", boss: "m3" },
		{ id: "e5", lv: "emp", label: "Yousef Amin", boss: "m2" },
		{ id: "e6", lv: "emp", label: "Dana Haddad", boss: "m2" },
		{ id: "e7", lv: "emp", label: "Mariam Zaki", boss: "m4" },
		{ id: "e8", lv: "emp", label: "Tariq Younes", boss: "m4" },
		{ id: "e9", lv: "emp", label: "Salma Farouk", boss: "m5" },
		{ id: "e10", lv: "emp", label: "Rami Odeh", boss: "m6" },
		{ id: "e11", lv: "emp", label: "Huda Salim", boss: "m7" },
		{ id: "e12", lv: "emp", label: "Fadi Karam", boss: "m8" }
	];

	// No goals are preloaded: everyone starts with an empty slate, and goals are created on the screens.
	var GOALS = {};

	return { PEOPLE: PEOPLE, GOALS: GOALS };
});
