import { ParsedField } from './fieldGenerator';

export interface ComponentSchema {
    [componentName: string]: {
        type: 'component' | 'repeater' | 'form';
        fields: {
            [fieldName: string]: string | ComponentSchema;
        };
    };
}

const mapType = (field: ParsedField): string => {
    switch (field.type) {
        case 'text': return 'string';
        case 'textarea': return 'text';
        case 'image': return 'image';
        case 'link': return 'url';
        case 'repeater': return 'repeater';
        default: return 'string';
    }
};

/**
 * STEP 2: Structured Schema Generation
 */
export const generateSchema = (fields: ParsedField[]): ComponentSchema => {
    const schema: ComponentSchema = {};

    const processFields = (flist: ParsedField[]) => {
        const fieldMap: Record<string, any> = {};
        flist.forEach(f => {
            if (f.type === 'repeater') {
                fieldMap[f.slug] = {
                    type: 'repeater',
                    fields: processFields(f.children || [])
                };
            } else if (f.type === 'container') {
                // Merge container children into parent
                Object.assign(fieldMap, processFields(f.children || []));
            } else {
                fieldMap[f.slug] = mapType(f);
            }
        });
        return fieldMap;
    };

    // Top level grouping by component type or generic sections
    fields.forEach(f => {
        let componentName = f.slug;
        if (f.type === 'container') {
            const nested = processFields(f.children || []);
            schema[componentName] = {
                type: 'component',
                fields: nested
            };
        } else if (f.type === 'repeater') {
            schema[componentName] = {
                type: 'repeater',
                fields: processFields(f.children || [])
            };
        } else {
            // Generic top-level fields
            if (!schema['global']) schema['global'] = { type: 'component', fields: {} };
            schema['global'].fields[f.slug] = mapType(f);
        }
    });

    return schema;
};
