// THE TEST SCENARIO: edit this one file to change who is in the demo. Nothing else needs to change.
//
// PEOPLE  one row per person.
//   id     any unique short text
//   lv     their level: "dg" (Director General), "ed" (Executive Director), "dir" (Director), "mgr" (Manager), "emp" (Employee)
//   label  how the person appears everywhere (dropdown, goals, approvals). Keep it unique.
//   boss   the id of the person they report to (their approver). The DG has none.
//   note   (managers only) one line shown when a Director picks teams to push a goal down to.
// The cascade is DG > ED > Director > Manager > Employee. Goals are created by Directors, pushed down to Managers,
// and Employees add goals under their Manager. A Director's goals are approved by the ED they report to.
//
// GOALS  starting goals, keyed by the Director's id (the Director, Digital goals are built into the module).
//   parent must be one of the five management goals (their titles are in Goals.js, MGMT).
//   pushed lists the Managers who already received the goal: { who: <manager label>, p: progress % }.
sap.ui.define([], function () {
	var PEOPLE = [
		{ id: "dg", lv: "dg", label: "Layla Mansour, Director General", boss: null },

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

	var GOALS = {
		d2: [
			{ id: 101, title: "Raise the share of stories with video to 50%", parent: "Grow video and live storytelling", status: "ok", statusText: "Approved", own: 30, measure: "Video on 50% of published stories by Q3", due: "30 September 2027", pushed: [{ who: "Manager, Video desk", p: 20, d: "9 Nov 2026", n: "Edit suites booked.", due: "30 September 2027" }] },
			{ id: 102, title: "Launch a live studio for breaking events", parent: "Grow video and live storytelling", status: "att", statusText: "Awaiting approval", own: 10, measure: "Studio live and used for 20 events", due: "31 December 2027", pushed: [] }
		],
		d3: [
			{ id: 103, title: "Cut CMS publish time to under 2 minutes", parent: "Faster digital delivery", status: "ok", statusText: "Approved", own: 50, measure: "Median CMS save-to-live under 2 minutes", due: "30 June 2027", pushed: [{ who: "Manager, CMS", p: 45, d: "8 Nov 2026", n: "Caching change is in test.", due: "30 June 2027" }] }
		],
		d4: [
			{ id: 104, title: "Grow social video views by 25%", parent: "Reach more Arabic-speaking audiences", status: "att", statusText: "Awaiting approval", own: 5, measure: "Monthly social video views up 25% on 2026", due: "31 December 2027", pushed: [] }
		],
		d5: [
			{ id: 105, title: "Publish a correction within 24 hours, every time", parent: "Accurate reporting, every time", status: "ok", statusText: "Approved", own: 60, measure: "100% of corrections published within 24 hours", due: "30 June 2027", pushed: [{ who: "Manager, Newsroom", p: 55, d: "7 Nov 2026", n: "Corrections log is live.", due: "30 June 2027" }] },
			{ id: 106, title: "Link every story to its sources", parent: "Accurate reporting, every time", status: "att", statusText: "Awaiting approval", own: 0, measure: "Sources linked on 90% of stories", due: "31 December 2027", pushed: [] }
		],
		d6: [
			{ id: 107, title: "Grow Arabic weekly readers by 15%", parent: "Reach more Arabic-speaking audiences", status: "ok", statusText: "Approved", own: 35, measure: "Weekly Arabic readers up 15% on 2026", due: "31 December 2027", pushed: [{ who: "Manager, Arabic desk", p: 30, d: "10 Nov 2026", n: "Headline testing started.", due: "31 December 2027" }] }
		]
	};

	return { PEOPLE: PEOPLE, GOALS: GOALS };
});
