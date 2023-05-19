import { addEvent, getCombatant, getEventById, getList, normalizeTicks, removeEvent, setTicks, updateEvent } from "./data.js";

export class TimelineApp extends Application 
{
    static get defaultOptions() 
    {
        const defaults = super.defaultOptions;
        const overrides = {
            height: '150',
            width: 'auto',
            id: 'timeline-app',
            template: `modules/tick-combat/templates/timeline.hbs`,
            title: 'Timeline'
        };

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
        return mergedOptions;
    };

    async getData() 
    {
        return {
            list : await getList()
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
        this.render(true);
    }

    async _handleRemoveEvent(event) {
        event.preventDefault();
        await removeEvent(event.currentTarget.id);
        await normalizeTicks();
        this.render(true);
    }

    async _handleChangeTicks(event) {
        const combatant = getCombatant(event.currentTarget.id);
        if (combatant)
            await setTicks(combatant, event.currentTarget.value);
        else 
        {
            const ev = await getEventById(event.currentTarget.id);
            if (ev)
            {
                ev.ticks = event.currentTarget.value;
                await updateEvent(ev);
            }
        }
        await normalizeTicks();
        this.render(true);
    }
    
};
