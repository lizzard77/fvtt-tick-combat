import { getCombatant, getEventById, getList, getCombatantInfo, normalizeTicks, removeEvent, setTicks, updateEvent, addEvent, setNote, toggleWaiting, toggleHideEvent } from "./data.js";
import { editEvent } from "./editEvent.js";

Hooks.on("getApplicationHeaderButtons", async (app, buttons) => {

    if (app.id === "timeline-app")
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
});

export class TimelineApp extends Application 
{
    static get defaultOptions() 
    {
        const defaults = super.defaultOptions;
        let width = getList().length*100;
        const overrides = {
            height: 'auto',
            resizable : false,
            id: 'timeline-app',
            template: `modules/tick-combat/templates/timeline.hbs`,
            title: 'Timeline',
            popOut: true
        };
        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
        return mergedOptions;
    }

    async setPosition({left, top, height, scale} = {})
    {
        let width = (await this.getData()).list.length * 120;
        super.setPosition({left, top, width, height, scale});
    }

    async getData() 
    {
        const list = getList();
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

        return {
            list : final,
            isGM : game.user.isGM
        }
    };

    activateListeners(html) 
    {
        super.activateListeners(html);
        html.on('blur', "input.ticks", this._handleChangeTicks.bind(this));
        html.on('keydown', "input.ticks", this._handleEnterKey.bind(this));
        html.on('click', ".name", this._handleEditItem.bind(this));
        html.on('click', ".ffwd", this._handleffwdButton.bind(this));
        html.on('click', ".delete", this._handleDeleteButton.bind(this));
        html.on('click', ".wait", this._handleWaitToggleButton.bind(this));
        html.on('click', ".hide", this._handleHideToggleButton.bind(this));
    };

    async _handleEditItem(event) {
        event.preventDefault();
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
            const current = getCombatantInfo(combatant).ticks || 0;
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
        if (event.key === "Enter")
        {
            event.preventDefault();
            this._handleChangeTicks(event);
        }
    }

    async _handleChangeTicks(event) {
        event.preventDefault();
        if (!game.user.isGM)
            return;
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
};


