var app = new Vue({ 
    el: '#app',
    data: {
        message: 'You loaded this page on ' + new Date().toLocaleString(),
        enabled: true,
        todos: [
            { text: 'Learn JavaScript' },
            { text: 'Learn Vue' },
            { text: 'Build something awesome' }
        ],
    },
    methods: {
        reverseMessage: function () {
            this.message = this.message.split('').reverse().join('')
        }
    }    
});
