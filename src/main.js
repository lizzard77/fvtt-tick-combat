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

/**
 * Update Combat hook
 */
Hooks.on("updateCombat", async (combat, update, options, userId) => {
    game.timeline.app.render(true);
});

/**
 * Delete Combat hook
 */
Hooks.on("deleteCombat", async (combat, options, userId) => {
    game.timeline.app.close();
    await clearEvents();
});

/* ----------------- Combatant ---------------- */

/**
 * Create Combatant hook
 */
Hooks.on("createCombatant", async (combatant, options, userId) => {
    await setTicks(combatant, 1);
    game.timeline.app.render(true);    
});

/**
 * Update Combatant hook
 */
Hooks.on("updateCombatant", async (combatant, updateData, options, userId) => {
    game.timeline.app.render(true);
});

/**
 * Delete Combatant hook
 */
Hooks.on("deleteCombatant", (combatant, options, userId) => {
    game.timeline.app.render(true);
});

/* ------------------- Actor ------------------ */

Hooks.on("updateActor", (actor, updateData, options, userId) => {
    game.timeline.app.render(true);
});

/* ------------------- Token ------------------ */

Hooks.on("updateToken", (token, updateData, options, userId) => {
    game.timeline.app.render(true);
});

/**
 * Combat Tracker Render hook
 */
Hooks.on("renderCombatTracker", (app, html, data) => {
    /*const enabled = game.settings.get(NAME, SETTING_KEYS.enabled);

    if (!enabled) return;

    const viewed = canvas.scene;
    const rendered = ui?.combatCarousel?.rendered;
    const collapsed = ui?.combatCarousel?._collapsed;
    const trackerCombat = ui.combat.viewed;
    const carouselCombat = ui.combatCarousel?.combat;
    const combatMatch = trackerCombat?.id === carouselCombat?.id;
    const isViewedCombat = trackerCombat?.scene == viewed;

    if (!data?.hasCombat && rendered) {
        ui.combatCarousel.close();
        // If set, re-expand the nav bar after combat closes
        const collapseNavSetting = game.settings.get(NAME, SETTING_KEYS.collapseNav);
        if (collapseNavSetting) ui.nav.expand();
    }

    if (data?.hasCombat && isViewedCombat && !combatMatch && collapsed === false) {
        ui.combatCarousel.render(true);
    }

    ui?.combatCarousel?.setToggleIcon();
    //console.log("combat tracker rendered:", app, html, data);*/
});

/**
 * Sidebar Collapse Hook
 */
Hooks.on("sidebarCollapse", (app, collapsed) => {
    /*const enabled = game.settings.get(NAME, SETTING_KEYS.enabled);
    if (!enabled || !ui.combatCarousel || ui.combatCarousel?._collapsed) return;
    ui.combatCarousel.setPosition();*/
});

/**
 * Render Scene Controls Hook
 */
Hooks.on("renderSceneControls", async (app, html, data) => {
    /*const enabled = game.settings.get(NAME, SETTING_KEYS.enabled);
    if (!enabled) return;
    return CombatCarousel._onRenderSceneControls(app, html, data);*/
});