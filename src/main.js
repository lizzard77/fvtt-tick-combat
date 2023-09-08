import { clearEvents, getCombatantAndEventsList, setTicks } from "./data.js";
import { TimelineApp } from "./timeline.js";

Hooks.on('ready', async () => {
    game.timeline = {
        app : new TimelineApp()
    }
    updateAppWindow();
});

Hooks.on('renderCombatTracker', (app, html, data) => {
    const actionButtons = html.find('.combat-tracker-header');
    const myButton = '<div class="flexrow"><button id="embedButton"><i class="fas fa-sword"></i>Show Timeline</button></div>';
    actionButtons.append(myButton);
    html.find("#embedButton").on('click', () => {
        game.timeline.app.render(true);
    });
});

Hooks.on("createCombat", async (combat, createData, options, userId) => {
    updateAppWindow();
});

Hooks.on("updateCombat", async (combat, update, options, userId) => {
    console.log("updateCombat");
    updateAppWindow();
});

Hooks.on("deleteCombat", async (combat, options, userId) => {
    game.timeline.app.close();
    await clearEvents();
});

Hooks.on("createCombatant", async (combatant, options, userId) => {
    if (game.user.isGM)
        await setTicks(combatant, 0);
    updateAppWindow();
});

Hooks.on("updateCombatant", async (combatant, updateData, options, userId) => {
    console.log("updateCombatant");
    updateAppWindow();
});

Hooks.on("deleteCombatant", (combatant, options, userId) => {
    updateAppWindow();
});

Hooks.on("updateActor", (actor, updateData, options, userId) => {
    updateAppWindow();
});

Hooks.on("updateToken", (token, updateData, options, userId) => {
    updateAppWindow();
});



function updateAppWindow() 
{
    const list = getCombatantAndEventsList();
    if (list.length == 0)
        game.timeline.app.close(true);

    else
        game.timeline.app.render(true);
}

