import { clearEvents, setTicks } from "./data.js";
import { TimelineApp } from "./timeline.js";

Hooks.on('ready', async () => {
    game.timeline = {
        app : new TimelineApp()
    }
    if (game.combat.isActive)
        game.timeline.app.render(true);
});

Hooks.on('renderCombatTracker', (app, html, data) => {
    const actionButtons = html.find('.encounters');
    const myButton = '<div class="flexrow"><button id="embedButton"><i class="fas fa-sword"></i>Show Timeline</button></div>';
    actionButtons.append(myButton);
    html.find("#embedButton").on('click', () => {
        game.timeline.app.render(true);
    });
});

Hooks.on("createCombat", async (combat, createData, options, userId) => {
    game.timeline.app.render(true);
});

Hooks.on("updateCombat", async (combat, update, options, userId) => {
    game.timeline.app.render(true);
});

Hooks.on("deleteCombat", async (combat, options, userId) => {
    game.timeline.app.close();
    await clearEvents();
});

Hooks.on("createCombatant", async (combatant, options, userId) => {
    await setTicks(combatant, 0);
    game.timeline.app.render(true);    
});

Hooks.on("updateCombatant", async (combatant, updateData, options, userId) => {
    game.timeline.app.render(true);
});

Hooks.on("deleteCombatant", (combatant, options, userId) => {
    game.timeline.app.render(true);
});

Hooks.on("updateActor", (actor, updateData, options, userId) => {
    game.timeline.app.render(true);
});

Hooks.on("updateToken", (token, updateData, options, userId) => {
    game.timeline.app.render(true);
});
