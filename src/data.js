
export async function setTicks(combatant, value = 0)
{
    await combatant.setFlag('tick-combat', 'ticks', value);
}

export async function normalizeTicks()
{
    const sorted = await getList();
    const normalize = sorted[0].ticks;
    for (const c of sorted)
    {
        const newTicks = c.ticks - normalize;
        if (c.isEvent)
        {
            c.ticks = newTicks;
            await updateEvent(game.combat, c);
        } 
        else 
        {
            await c.combatant.setFlag('tick-combat', 'ticks', newTicks);
            await game.combat?.setInitiative(c.id, newTicks);
        }
    }
 
    //await combatant.setFlag('tick-combat', 'ticks', value);
    //await game.combat?.setInitiative(combatant?._id, value);
}

export function getCombatant(id)
{
    let combatants = game.combat?.combatants;
    return combatants.find(c => c._id === id);
}

export async function getList()
{
    let combatants = game.combat?.combatants;
    
    let result = [];
    for (const combatant of combatants) {
        result.push({
            id : combatant._id,
            combatant: combatant,
            name : combatant.name,
            isEvent : false,
            ticks : await combatant.getFlag('tick-combat', 'ticks')
        });
    };

    let events = game.combat?.getFlag('tick-combat', 'events') || [];
    let timelineItems = [...result, ...events];
    if (!timelineItems || timelineItems.length === 0) 
        return [];
    return timelineItems.sort((a, b) => a.ticks - b.ticks);
}

export async function addEvent(event)
{
    const events = await game.combat?.getFlag('tick-combat', 'events') || [];
    event.id = crypto.randomUUID();
    event.isEvent = true;
    events.push(event);
    await game.combat?.setFlag('tick-combat', 'events', events);
}

export async function removeEvent(event)
{
    const events = await game.combat?.getFlag('tick-combat', 'events') || [];
    const index = events.indexOf(event);
    if (index > -1) {
        events.splice(index, 1);
        await game.combat?.setFlag('tick-combat', 'events', events);
    }
}

export async function clearEvents()
{
    await game.combat?.unsetFlag('tick-combat', 'events');
}

export async function updateEvent(event)
{
    const events = await game.combat?.getFlag('tick-combat', 'events') || [];
    const index = events.indexOf(events.find(e => e.id === event.id));
    if (index > -1) {
        events[index] = event;
        await game.combat?.setFlag('tick-combat', 'events', events);
    }
}

export async function getEventById(id)
{
    const events = await game.combat?.getFlag('tick-combat', 'events') || [];
    return events.find(e => e.id === id);
}