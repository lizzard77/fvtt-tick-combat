import { addEvent, getCombatant, getEventById, getList, normalizeTicks, removeEvent, setTicks, updateEvent } from "./data.js";

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

        return {
            list : final
        }
    };

    activateListeners(html) 
    {
        super.activateListeners(html);
        html.on('click', "#addEventButton", this._handleAddEvent.bind(this));
        html.on('click', "#removeEventButton", this._handleRemoveEvent.bind(this));
        html.on('blur', "input.ticks", this._handleChangeTicks.bind(this));

    };

    async _handleAddEvent(event) {
        event.preventDefault();
        await addEvent({ name: "New Event", ticks: 3 });
        await normalizeTicks();
    }

    async _handleRemoveEvent(event) {
        event.preventDefault();
        await removeEvent(event.currentTarget.id);
        await normalizeTicks();
    }

    async _handleChangeTicks(event) {
        const newTick = event.currentTarget.value;
        const combatant = getCombatant(event.currentTarget.id);
        const ev = await getEventById(event.currentTarget.id);

        if (combatant)
        {
            await setTicks(combatant, newTick);
        }
        else if (ev)
        {
            ev.ticks = newTick;
            await updateEvent(ev);
        }
        await normalizeTicks();
    }
    
};
