var Login = {
  	data: function() {
  		return {
			email: '',
			password: '',
			showPassword: false,
			messages: []
  		}
	},
	computed: {
		passwordFieldType: function() {
			if (this.showPassword) {
				return 'text';
			} else {
				return 'password';
			}
		}
	},
	methods: {
		submit: function() {
			this.messages = [];
			var body = 'email=' + this.email + '&password=' + this.password;

			var vueContext = this;
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (this.readyState == 4) {
					var responseObj = JSON.parse(this.responseText);

					if (this.status == 200 && true == responseObj.auth) {
						vueContext.tokenIsValid = true;
						document.cookie = "jwt=" + responseObj.token;
						vueContext.messages.push({ type: 'success', message: responseObj.message });

						// cleanup info
						vueContext.email = '';
						vueContext.password = '';

					} else {
						vueContext.messages.push({ type: 'error', message: responseObj.message });
						document.cookie = "jwt=";
					}
					vueContext.$emit('token-updated');


				}
			};
			xhttp.open("POST", "/api/auth/login", true);
			xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhttp.send(body);
		},
		cancel: function() {
			this.$emit('cancel');
		}
	},
	template: `
	<div class="form">
		<h2 class="form__title">Login</h2>
		<div class="form__field">
			<label>Email</label>
			<input type="text" v-model="email" placeholder="example@email.com">
		</div>
		<div class="form__field">
			<label>Password</label>
			<input v-bind:type="passwordFieldType" v-model="password" placeholder="super secret password" >
		</div>
		<div class="form__field form__field--checkbox">
			<input type="checkbox" v-model="showPassword">
			<label for="checkbox">Show password</label>
		</div>
		<div class="form__actions">
			<input class="form__actions__submit button button5" type="button" value="Submit" v-on:click="submit">
			<input class="form__actions__cancel button button5" type="button" value="Cancel" v-on:click="cancel">
		</div>
		<div class="form__messages" v-if="messages.length">
			<div v-for="message in messages"
				class="form__messages__message"
				v-bind:class="{
					form__messages__error: message.type == 'error',
					form__messages__success: message.type == 'success',
					form__messages__warn: message.type == 'warn' }"
			>
				<span>{{ message.message }}</span>
			</div>
		</div>
	</div>`
}