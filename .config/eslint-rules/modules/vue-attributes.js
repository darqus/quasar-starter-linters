// Vue attributes specific configuration for optimal attribute ordering
// Based on Vue strongly-recommended configuration with added attributes-order rule

export const vueAttributes = {
  // STRICT ATTRIBUTE ORDERING - добавляем к strongly-recommended
  'vue/attributes-order': [
    'error',
    {
      order: [
        // 1. DEFINITION - Elements that define what this component is
        'DEFINITION', // 'is', 'v-is'

        // 2. LIST_RENDERING - Elements that change how the component is rendered in a list
        'LIST_RENDERING', // 'v-for item in items'

        // 3. CONDITIONALS - Elements that conditionally render the component
        'CONDITIONALS', // 'v-if', 'v-else-if', 'v-else', 'v-show', 'v-cloak'

        // 4. RENDER_MODIFIERS - Elements that change the way the component renders
        'RENDER_MODIFIERS', // 'v-pre', 'v-once'

        // 5. GLOBAL - Elements that are unique across the whole app
        'GLOBAL', // 'id'

        // 6. UNIQUE/SLOT - Elements that must be unique or define slots
        [ 'UNIQUE', 'SLOT' ], // 'ref', 'key', 'v-slot', 'slot'

        // 7. TWO_WAY_BINDING - Elements that create two-way binding
        'TWO_WAY_BINDING', // 'v-model'

        // 8. OTHER_DIRECTIVES - All other directives
        'OTHER_DIRECTIVES', // 'v-custom-directive'

        // 9. ATTR_DYNAMIC - Dynamic attributes (with bindings)
        'ATTR_DYNAMIC', // 'v-bind:prop="foo"', ':prop="foo"'

        // 10. ATTR_STATIC - Static attributes (without bindings)
        'ATTR_STATIC', // 'prop="foo"', 'custom-prop="foo"'

        // 11. ATTR_SHORTHAND_BOOL - Boolean attributes without values
        'ATTR_SHORTHAND_BOOL', // 'boolean-prop'

        // 12. EVENTS - Event handlers
        'EVENTS', // '@click="functionCall"', 'v-on="event"'

        // 13. CONTENT - Elements that modify the content
        'CONTENT', // 'v-text', 'v-html'
      ],
      alphabetical: true, // Sort alphabetically within each group
    },
  ],

  // ATTRIBUTE HYPHENATION (совместимо с strongly-recommended)
  'vue/attribute-hyphenation': [
    'error',
    'always',
    {
      ignore: [],
    },
  ],

  // PROP NAME CASING (совместимо с strongly-recommended)
  'vue/prop-name-casing': [ 'error', 'camelCase' ],
}
