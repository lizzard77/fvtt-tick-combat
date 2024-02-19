import { clearEvents, getCombatantAndEventsList, setTicks } from "./data.js";
import { TimelineApp } from "./timeline.js";
import { DamageTypeSettingsApp } from "./damageTypeSettings.js";
import { damageLog } from "./damageLogDialog.js";

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

    game.settings.register("tick-combat", "damageTypes", {
        name: "Schadensarten",
        label: "Arten von Schaden",
        scope: "world",
        type: Array,
        default: [ { label : "Blessuren", cumulative : true } ],
        config: false
    });

    game.settings.registerMenu("tick-combat", "damageTypesMenu", {
        name: "Schadensarten",
        label: "Arten von Schaden festlegen",      // The text label used in the button
        hint: "A description of what will occur in the submenu dialog.",
        icon: "fas fa-bars",               // A Font Awesome icon used in the submenu button
        type: DamageTypeSettingsApp,   // A FormApplication subclass
        restricted: true                   // Restrict this submenu to gamemaster only?
    });
    
     game.settings.set("tick-combat", "damageTypes", [ { label : "Blessuren", cumulative : true } ]);   
});



Hooks.on('ready', async () => {
    game.timeline = {
        app : new TimelineApp()
    }
    updateAppWindow();
    const someVariable = game.settings.get('tick-combat','damageTypes');
    console.log(someVariable); // expected to be 'foo'
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

Hooks.on("preUpdateActor", async (actor, updateData, options, userId) => {
    console.log("updateActor");
    if (updateData?.system.health.value !== undefined)
        {
            const setting = game.settings.get('tick-combat', 'damageTypes') || [];
            if (setting.length == 0)
                return;

            const currentHealth = actor.system.health.value;
            const newHealth = updateData.system.health.value;
            const type = newHealth < currentHealth ? "schaden" : "heilung";
            await damageLog(actor, type, Math.abs(currentHealth-newHealth));
        }
    //updateAppWindow();
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

