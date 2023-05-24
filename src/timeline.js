import { getCombatant, getEventById, getList, getCombatantInfo, normalizeTicks, removeEvent, setTicks, updateEvent } from "./data.js";
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
                    ticks: 100,
                    ffwd: 1
                };
                await editEvent(data);
            }
        });
    }
});

export class TimelineApp extends Application 
{
    static get defaultOptions() 
    {
        const defaults = super.defaultOptions;
        const overrides = {
            height: 'auto',
            width: 'auto',
            id: 'timeline-app',
            template: `modules/tick-combat/templates/timeline.hbs`,
            title: 'Timeline',
            popOut: true,
            resizable: true,
        };

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
        return mergedOptions;
    };

    async getData() 
    {
        const list = await getList();
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

        this.width = final.length * 150;

        return {
            list : final
        }
    };

    activateListeners(html) 
    {
        super.activateListeners(html);
        html.on('click', "#removeEventButton", this._handleRemoveEvent.bind(this));
        html.on('blur', "input.ticks", this._handleChangeTicks.bind(this));
        html.on('click', ".name", this._editItem.bind(this));
        html.on('click', ".ffwd", this._ffwdEvent.bind(this));
        html.on('click', ".delete", this._deleteEvent.bind(this));
    };

    async _handleRemoveEvent(event) {
        event.preventDefault();
        await removeEvent(event.currentTarget.id);
        await normalizeTicks();
    }

    async _editItem(event) {
        event.preventDefault();
        const ev = await getEventById(event.currentTarget.dataset.id);
        if (ev)
        {
            await editEvent(ev);
        }
    }

    async _ffwdEvent(event) {
        event.preventDefault();
        const ev = await getEventById(event.currentTarget.dataset.id);
        if (ev)
        {
            ev.ticks = ev.ticks + ev.ffwd;
            await updateEvent(ev);
            await normalizeTicks();
        }
    }

    async _deleteEvent(event) {
        event.preventDefault();
        const ev = await getEventById(event.currentTarget.dataset.id);
        if (ev)
        {
            await removeEvent(ev);
            await normalizeTicks();
        }
    }

    async _handleChangeTicks(event) {
        const newTick = parseInt(event.currentTarget.value);
        const combatant = getCombatant(event.currentTarget.dataset.id);
        const ev = await getEventById(event.currentTarget.dataset.id);

        if (combatant)
        {
            const current = (await getCombatantInfo(combatant)).ticks || 0;
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


