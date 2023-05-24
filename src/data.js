
export async function setTicks(combatant, value = 0, ffwd = 0)
{
    await combatant.setFlag('tick-combat', 'ticks', value);
    if (ffwd)
        await combatant.setFlag('tick-combat', 'ffwd', ffwd);
    await game.combat?.setInitiative(combatant.id, value);
}

export async function normalizeTicks()
{
    const sorted = await getList();
    if (!sorted.length)
        return;
    const normalize = sorted[0].ticks;
    for (const c of sorted)
    {
        const newTicks = c.ticks - normalize;
        if (c.isEvent)
        {
            c.ticks = newTicks;
            await updateEvent(c);
        } 
        else 
        {
            await setTicks(c.combatant, newTicks);
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
        result.push(await getCombatantInfo(combatant));
    };

    let events = game.combat?.getFlag('tick-combat', 'events') || [];
    let timelineItems = [...result, ...events];
    if (!timelineItems || timelineItems.length === 0) 
        return [];
    return timelineItems.sort((a, b) => a.ticks - b.ticks);
}

export async function getCombatantInfo(combatant) {
    return {
        id: combatant._id,
        combatant: combatant,
        name: combatant.name,
        isEvent: false,
        ticks: parseInt(await combatant.getFlag('tick-combat', 'ticks')),
        ffwd: parseInt(await combatant.getFlag('tick-combat', 'ffwd'))
    };
}

export async function addEvent(event)
{
    const events = await game.combat?.getFlag('tick-combat', 'events') || [];
    event.id = crypto.randomUUID();
    event.isEvent = true;
    event.ffwd = 8;
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