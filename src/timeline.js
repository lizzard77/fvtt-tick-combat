import { getCombatant, getEventById, getCombatantAndEventsList, getCombatantInfo, normalizeTicks, removeEvent, setTicks, updateEvent, addEvent, setNote, toggleWaiting, toggleHideEvent } from "./data.js";
import { editEvent } from "./editEvent.js";

Hooks.on("getApplicationHeaderButtons", async (app, buttons) => {
    if (app.id === "timeline-app")
    {
        //buttons.splice(0,1);
        buttons[0].onclick = async() => {
            game.timeline.app.close(true);
        };

        buttons.unshift({
            class: "scaleButton",
            icon: "fas fa-magnifying-glass",
            onclick: async () => {
                let scale = (game.settings.get("tick-combat", "scale") || 1.0)+0.25;
                if (scale > 1.5)
                    scale = 0.75;
                game.settings.set("tick-combat", "scale", scale);
            }
        });

        if (game.user.isGM)
        {
            buttons.unshift({
                label: "Add Event",
                class: "addEventButton",
                icon: "fas fa-plus",
                onclick: async () => {
                    const data = {
                        name: "New Event",
                        isEvent : true,
                        ticks: 100,
                        ffwd: 1,
                        repeating : true,
                        notes : ""
                    };
                    await editEvent(data, async (d) => {
                        d.isNew ? await addEvent(d) : await updateEvent(d);
                        await normalizeTicks();
                    });
                }
            });
        }
    }
});

export class TimelineApp extends Application 
{
    static get defaultOptions() 
    {
        const defaults = super.defaultOptions;
        const scale = game.settings.get("tick-combat", "scale");
        
        const overrides = {
            height: 'auto',
            width: 'auto',
            scale,
            resizable : false,
            id: 'timeline-app',
            template: `modules/tick-combat/templates/timeline.hbs`,
            title: 'Timeline',
            popOut: true
        };
        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
        return mergedOptions;
    }

    close(force = false)
    {
        // override to prevent closing by default
        if (force)
        {
            if (game.user.isGM)
                game.combat?.endCombat();
            return super.close();
        }
    }

    async setPosition({left, top, height} = {})
    {
        let width = (await this.getData()).list.length * 120 + 70;
        const scale = game.settings.get("tick-combat", "scale");
        super.setPosition({left, top, width, height, scale});
    }

    async getData() 
    {
        const list = getCombatantAndEventsList();
        let final = [];
        for (const ev of list) 
        {
            let l = final.find(x => x.ticks === ev.ticks);
            if (!l)
            {
                l = { ticks: ev.ticks, items: [ ev ]  };
                final.push(l);
            } else {
                l.items.push(ev);
            }
        }

        const scale = game.settings.get("tick-combat", "scale");
        const totalTicks = game.combat?.getFlag('tick-combat', 'totalTicks') || 0;
        const started = game.combat?.started || false;

        return {
            list : final,
            isGM : game.user.isGM,
            scale, 
            totalTicks,
            started
        }
    }

    activateListeners(html) 
    {
        super.activateListeners(html);
        //html.on('blur', "input.ticks", this._handleChangeTicks.bind(this));
        html.on('keydown', "input.ticks", this._handleEnterKey.bind(this));
        html.on('click', ".name", this._handleEditItem.bind(this));
        html.on('click', ".ffwd", this._handleffwdButton.bind(this));
        html.on('click', ".delete", this._handleDeleteButton.bind(this));
        html.on('click', ".wait", this._handleWaitToggleButton.bind(this));
        html.on('click', ".hide", this._handleHideToggleButton.bind(this));
        html.on('click', ".startButton", this._handleStartButton.bind(this));
    }

    async _handleStartButton(event) {
        event.preventDefault();
        game.combat?.setFlag('tick-combat', 'totalTicks', 0);
        if (!game.combat?.started)
            game.combat?.startCombat();
    }

    async _handleEditItem(event) {
        event.preventDefault();

        if (event.shiftKey) 
        {
            //console.log(game.canvas.layers);
            const combatant = getCombatant(event.currentTarget.dataset.id);
            if (combatant?.token)
            {
                const offset = game.scenes.current?.grid?.size / 2 || 0;
                await game.canvas.ping({ x: combatant.token.x + offset, y: combatant.token.y + offset }, { duration: 3000 });
            }
            return;
        }

        if (!game.user.isGM)
            return;
        const combatant = getCombatant(event.currentTarget.dataset.id);
        const ev = await getEventById(event.currentTarget.dataset.id);
        if (combatant)
        {
            const current = await getCombatantInfo(combatant);
            await editEvent(current, async (d) => {
                await setTicks(combatant, d.ticks);
                await setNote(combatant, d.notes);
                await combatant.update({ name : d.name });
                if (combatant.token)
                    await combatant.token.update({ name : d.name });
                await normalizeTicks();
            });
        } else if (ev)
        {
            await editEvent(ev, async (d) => {
                d.isNew ? await addEvent(d) : await updateEvent(d);
                await normalizeTicks();
            });
        }
    }

    async _handleffwdButton(event) {
        event.preventDefault();
        if (!game.user.isGM)
            return;
        const ev = await getEventById(event.currentTarget.dataset.id);
        if (ev)
        {
            if (ev.ffwd > 0)
            {
                ev.ticks = ev.ticks + ev.ffwd;
                await updateEvent(ev);
            } else {
                await removeEvent(ev);
            }
            await normalizeTicks();
        }
    }

    async _handleWaitToggleButton(event) {
        event.preventDefault();
        const combatant = getCombatant(event.currentTarget.dataset.id);
        if (combatant)
        {
            await toggleWaiting(combatant);
            await normalizeTicks();
        }
    }

    async _handleHideToggleButton(event) {
        event.preventDefault();
        if (!game.user.isGM)
            return;
        const ev = await getEventById(event.currentTarget.dataset.id);
        if (ev)
        {
            await toggleHideEvent(ev);
        }
    }

    async _handleDeleteButton(event) {
        event.preventDefault();
        if (!game.user.isGM)
            return;
        const ev = await getEventById(event.currentTarget.dataset.id);
        if (ev)
        {
            await removeEvent(ev);
            await normalizeTicks();
        }
    }

    async _handleEnterKey(event)
    {
        if (event.key === "Enter" && game.user.isGM)
        {
            event.preventDefault();
            const newTick = parseInt(event.currentTarget.value);
            if (!newTick)
                return;

            const combatant = getCombatant(event.currentTarget.dataset.id);
            const ev = await getEventById(event.currentTarget.dataset.id);

            if (combatant)
            {
                const current = getCombatantInfo(combatant).ticks || 0;
                await setTicks(combatant, current + newTick, newTick);
            }
            else if (ev)
            {
                ev.ticks = newTick;
                await updateEvent(ev);
            }
            await normalizeTicks();
        }
    }
}


