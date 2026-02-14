import { ParsedField } from './fieldGenerator';

export const generateACF = (fields: ParsedField[], templateName: string = 'Generated Template') => {
    /**
     * Helper to map a ParsedField to an ACF field object
     */
    const mapField = (field: ParsedField, parentSlug: string = ''): any => {
        // Unique key based on hierarchy to avoid ACF collisions
        const keyPrefix = parentSlug ? `${parentSlug}_` : '';
        const fieldKey = `field_${keyPrefix}${field.slug}`;

        const baseField: any = {
            key: fieldKey,
            label: field.slug
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
            name: field.slug,
            type: field.type,
            instructions: `Generated field for ${field.tag} tag`,
            required: 0,
            conditional_logic: 0,
            wrapper: {
                width: '',
                class: '',
                id: '',
            },
            default_value: '',
            placeholder: '',
            prepend: '',
            append: '',
        };

        // Handle specific field type requirements
        if (field.type === 'image') {
            baseField.return_format = 'array';
            baseField.preview_size = 'medium';
            baseField.library = 'all';
        } else if (field.type === 'link') {
            baseField.return_format = 'array';
        } else if (field.type === 'repeater' && field.children) {
            // Recursive call for sub-fields with parent context
            baseField.sub_fields = field.children.map(child => mapField(child, field.slug));
            baseField.collapsed = '';
            baseField.min = 0;
            baseField.max = 0;
            baseField.layout = 'block';
            baseField.button_label = 'Add Row';
        }

        return baseField;
    };

    const acfFields = fields.map(field => mapField(field));
    const templatePath = `${templateName.toLowerCase().replace(/\s+/g, '-')}.php`;

    const acfGroup = {
        key: `group_${toSnakeCase(templateName)}`,
        title: `${templateName} Fields`,
        fields: acfFields,
        location: [
            [
                {
                    param: 'page_template',
                    operator: '==',
                    value: templatePath,
                },
            ],
        ],
        menu_order: 0,
        position: 'normal',
        style: 'default',
        label_placement: 'top',
        instruction_placement: 'label',
        hide_on_screen: '',
        active: true,
        description: `Auto-generated ACF fields for ${templateName}`,
    };

    return acfGroup;
};

const toSnakeCase = (str: string): string => {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .toLowerCase()
        .replace(/^_+|_+$/g, '');
};
