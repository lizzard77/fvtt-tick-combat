import { clearEvents, setTicks } from "./data.js";
import { TimelineApp } from "./timeline.js";

Hooks.on('ready', async () => {
    game.timeline = {
        app : new TimelineApp()
    }
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
    /*const enabled = game.settings.get(NAME, SETTING_KEYS.enabled);
    const openOnCreate = game.settings.get(NAME, SETTING_KEYS.openOnCombatCreate);

    if (!enabled || !ui.combatCarousel || (ui.combatCarousel?._collapsed && !openOnCreate)) return;
    
    ui.combatCarousel.render(true);

    // If set, collapse the Nav bar
    const collapseNavSetting = game.settings.get(NAME, SETTING_KEYS.collapseNav);
    if (collapseNavSetting) ui.nav.collapse();

    const hasTurns = combat?.turns?.length;
    const carouselImg = ui?.controls?.element.find("img.carousel-icon");
    const newImgSrc = hasTurns ? CAROUSEL_ICONS.hasTurns : CAROUSEL_ICONS.noTurns;
    
    carouselImg.attr("src", newImgSrc);*/
});

/**
 * Update Combat hook
 */
Hooks.on("updateCombat", async (combat, update, options, userId) => {
    let combatants = game.combat.combatants;
    for (const combatant of combatants) {
        await setTicks(combatant, 2);
    }
    game.timeline.app.render(true);

    /*const enabled = game.settings.get(NAME, SETTING_KEYS.enabled);

    if (!enabled || ui.combatCarousel?._collapsed) return;

    //console.log("combat update", {combat, update, options, userId});

    if (getProperty(update, "active") === true || hasProperty(update, "round")) {
        return ui.combatCarousel.render(true);
    }

    if (hasProperty(update, "turn")) {
        if (update.turn !== ui.combatCarousel.turn) {
            ui.combatCarousel.turn = update.turn;

            return ui.combatCarousel.render();
            //return ui.combatCarousel.setActiveCombatant(combatant);
        }

        //ui.combatCarousel.render();
    }*/
    
    

    /*
    if (combat.turns.length <= 0) {
        ui.combatCarousel.collapse();
        ui.combatCarousel.setToggleIcon("noTurns");
    }
    */
    //return ui.combatCarousel.render();
});

/**
 * Delete Combat hook
 */
Hooks.on("deleteCombat", async (combat, options, userId) => {
    game.timeline.app.close();
    await clearEvents();
    /*const enabled = game.settings.get(NAME, SETTING_KEYS.enabled);

    if (!enabled || ui.combatCarousel?._collapsed) return;

    if (!game.combat) {
        await ui.combatCarousel.collapse();
        ui.combatCarousel.close();
        //await ui.combatCarousel.render(true);
        //ui.combatCarousel.collapse();
    }

    const carouselImg = ui.controls.element.find("img.carousel-icon");
    carouselImg.attr("src", CAROUSEL_ICONS.noCombat);*/
});

/* ----------------- Combatant ---------------- */

/**
 * Create Combatant hook
 */
Hooks.on("createCombatant", async (combatant, options, userId) => {
    await setTicks(combatant, 1);
    game.timeline.app.render(true);    

    /*const enabled = game.settings.get(NAME, SETTING_KEYS.enabled);

    if (!enabled || !ui.combatCarousel || ui.combatCarousel?._collapsed) return;

    //console.log("create combatantant:", {combat, createData, options, userId});
    
    // calculate the new turn order
    const newTurns = combatant.parent?.setupTurns() ?? [];

    // grab the new combatant
    const turn = newTurns.find(t => t.id === combatant.id);

    if (!turn) return;

    const templateData = {
        combatant: ui.combatCarousel.prepareTurnData(turn)
    };

    if (!templateData) return;

    const combatantCard = await renderTemplate("modules/combat-carousel/templates/combatant-card.hbs", templateData);
    const index = newTurns.map(t => t.id).indexOf(combatant.id) ?? -1;
    
    await ui.combatCarousel.splide.emit("addCombatant", combatantCard, index);
    
    ui.combatCarousel.setToggleIcon();

    if (ui.combatCarousel._collapsed) {
        ui.combatCarousel.expand();
    }

    ui.combatCarousel.render();

    const carouselImg = ui.controls.element.find("img.carousel-icon");

    if (carouselImg.attr("src") != CAROUSEL_ICONS.hasTurns) carouselImg.attr("src", CAROUSEL_ICONS.hasTurns);*/
});

/**
 * Update Combatant hook
 */
Hooks.on("updateCombatant", async (combatant, updateData, options, userId) => {
    game.timeline.app.render(true);
    /*const enabled = game.settings.get(NAME, SETTING_KEYS.enabled);

    if (!enabled || ui.combatCarousel?._collapsed) return;*/
    
    //console.log("combatant update", {combat, update, options, userId});
    //ui.combatCarousel.splide.go()
    //ui.combatCarousel.splide.refresh();
    /*
    const turn = combat.turns.find(t => t.id === update.id);
    const combatant = CombatCarousel.prepareTurnData(turn);
    const template = await renderTemplate("modules/combat-carousel/templates/combatant-card.hbs", {combatant});
    const cardToReplace = ui.combatCarousel.element.find(`li[data-combatant-id="${update.id}"]`);
    cardToReplace.replaceWith(template);
    ui.combatCarousel.splide.refresh();
    */
    
    /*if (updateData?.hidden && !game.user.isGM) {
        return ui.combatCarousel.render(true);
    }

    const safeRender = debounce(() => {
        ui.combatCarousel.render(), 100
    });
    
    safeRender();*/
});

/**
 * Delete Combatant hook
 */
Hooks.on("deleteCombatant", (combatant, options, userId) => {
    game.timeline.app.render(true);
    /*const enabled = game.settings.get(NAME, SETTING_KEYS.enabled);

    if (!enabled || ui.combatCarousel?._collapsed) return;

    //console.log("delete combatant:", {combat, combatant, options, userId});
    
    const index = ui.combatCarousel.getCombatantSlideIndex(combatant);

    if (index < 0) return;

    ui.combatCarousel.splide.remove(index);
    ui.combatCarousel.setPosition({width: ui.combatCarousel._getMinimumWidth()});

    const combatHasTurns = combat?.turns?.length;

    const carouselImg = ui.controls.element.find("img.carousel-icon");

    if (!combatHasTurns) carouselImg.attr("src", CAROUSEL_ICONS.noTurns);*/
});

/* ------------------- Actor ------------------ */

Hooks.on("updateActor", (actor, updateData, options, userId) => {
    game.timeline.app.render(true);
    /*const enabled = game.settings.get(NAME, SETTING_KEYS.enabled);

    if (!enabled || !game.combat || ui.combatCarousel?._collapsed) return;

    // try to use system's primary attribute bar, then fallback to combat carousel setting, then fallback to matching all data updates
    const barProperty = game.system.primaryTokenAttribute ?? game.settings.get(NAME, SETTING_KEYS.bar1Attribute);
    const hasUpdatedBar1 = hasProperty(updateData, `system.${barProperty}`);

    const hasUpdatedOverlayProperties = game.settings.get(NAME, SETTING_KEYS.overlaySettings)
      .filter(o => o.value).reduce((a,o) => a || hasProperty(updateData, o.value), false);

    if (!hasUpdatedBar1 && !hasUpdatedOverlayProperties && !hasProperty(updateData, "img") && !hasProperty(updateData, "name")) return;
    // find any matching combat carousel combatants
    
    if (!game.combat?.combatants.some(c => c.actor.id === actor.id)) return;
    // update their hp bar

    ui.combatCarousel.render();*/
});

/* ------------------- Token ------------------ */

Hooks.on("updateToken", (token, updateData, options, userId) => {
    game.timeline.app.render(true);
    /*const enabled = game.settings.get(NAME, SETTING_KEYS.enabled);

    if (!enabled || !game.combat || ui.combatCarousel?._collapsed) return;

    //console.log("token update:", scene,token,update,options,userId);
    if (
        !hasProperty(updateData, "effects")
        && !hasProperty(updateData, "overlayEffect")
        && !hasProperty(updateData, "actorData")
        && !hasProperty(updateData, "img")
        && !hasProperty(updateData, "name")
    ) return;
    // find any matching combat carousel combatants
    
    if (!game.combat.combatants.some(c => c.token.id === token.id)) return;
    
    // update their hp bar and effects
    ui.combatCarousel.render();*/
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