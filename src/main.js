import { clearEvents, getCombatantAndEventsList, setTicks } from "./data.js";
import { TimelineApp } from "./timeline.js";

Hooks.on('init', () => {
    game.settings.register("tick-combat", "scale", {
        name: "Skalierung",
        label: "Timeline-Skalierung",
        scope: "client",
        type: Number,
        default: 1.0,
        config: true,
        onChange: () => {
            game.timeline.app.setPosition();
        }
    });
});

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
    await clearEvents();
    updateAppWindow();
});

Hooks.on("updateCombat", async (combat, update, options, userId) => {
    console.log("updateCombat");
    updateAppWindow();
});

Hooks.on("deleteCombat", async (combat, options, userId) => {
    game.timeline.app.close(true);
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
    console.log("updateActor");
    updateAppWindow();
});

function updateAppWindow() 
{
    const list = getCombatantAndEventsList();
    if (list.length == 0)
    {
        if (game.timeline.app.rendered)
            game.timeline.app.close(true);
    } else {
        game.timeline.app.render(true);
    }
}

