export class DamageTypeSettingsApp extends FormApplication 
{
    static get defaultOptions() {
        //return super.defaultOptions;
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['form'],
            popOut: true,
            height: "auto",
            template: `modules/tick-combat/templates/damageTypeSettings.hbs`,
            id: 'damage-type-settings',
            title: 'Damage Types',
        });
    }

    async getData() {
        const setting = game.settings.get('tick-combat', 'damageTypes') || [];
        return {
            list : setting
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.on('click', ".add", this._handleAddButton.bind(this));
        html.on('click', ".remove", this._handleRemoveButton.bind(this));
    }

    _updateObject(event, formData) {
        const data = expandObject(formData);
        const setting = [];
        // convert to array - handlebars/expandObject returns object 
        Object.keys(data.list).forEach(key => {
            setting.push(data.list[key]);
        });
        game.settings.set('tick-combat', 'damageTypes', setting);
    }

    async _handleAddButton(event) {
        event.preventDefault();

        const setting = game.settings.get('tick-combat', 'damageTypes') || [];
        setting.push({ label: 'neu', cumulative : true });
        game.settings.set('tick-combat', 'damageTypes', setting);

        await this._render();
    }

    async _handleRemoveButton(event) {
        event.preventDefault();
        // get data-id attribute from event target
        const index = event.currentTarget.getAttribute('data-id');

        const setting = game.settings.get('tick-combat', 'damageTypes') || [];
        // remove element from array
        setting.splice(index, 1);
        game.settings.set('tick-combat', 'damageTypes', setting);
        await this._render();
    }
}

//window.DamageTypeSettings = DamageTypeSettingsApp;