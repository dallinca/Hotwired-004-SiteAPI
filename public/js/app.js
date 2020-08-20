Vue.component('authentication', {
  	data: function() {
  		return {
  			useDefaultLogoutButton: false,
  			displayModal: false,
			displayRegister: false,
			displayLogin: true,
			hasToken: false,
			tokenIsValid: false
  		}
	},
	created: function() {
		this.checkToken();
		this.$emit('get-token-function', this.findToken);
	},
	watch: {
		tokenIsValid: function() {
			this.$emit('token-status-change', this.tokenIsValid);
		}
	},
	methods: {
		cancelRegister: function() {
			this.displayModal = false;
		},
		cancelLogin: function() {
			this.displayModal = false;
		},
		authDisplay: function(display) {
			if ('register' == display) {
				this.displayRegister = true;
				this.displayLogin = false;
			} else if ('login' == display) {
				this.displayLogin = true;
				this.displayRegister = false;
			}
		},
		logout: function() {
			document.cookie = "jwt=";
			this.hasToken = false;
			this.tokenIsValid = false;
		},
		findToken: function() {
			var token = document.cookie.replace(/(?:(?:^|.*;\s*)jwt\s*\=\s*([^;]*).*$)|^.*$/, "$1");
			if (token) {
				this.hasToken = true;
			} else {
				this.hasToken = false;
				return false;
			}
			return token;
		},
		checkToken: function() {
			// Check if a token exists
			var token = this.findToken();
			if (!this.hasToken) {
				tokenIsValid = false;
				return;
			}

			// If token exists attempt to validate
			var vueContext = this;
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (this.readyState == 4) {
					var responseObj = JSON.parse(this.responseText);

					if (false == responseObj.auth) {
						vueContext.tokenIsValid = false;
						document.cookie = "jwt=";
						vueContext.findToken();
					}

					if (this.status == 200 && true == responseObj.auth) {
						vueContext.tokenIsValid = true;
						vueContext.displayModal = false;
					}

				}
			};
			xhttp.open("GET", "/api/auth/checkToken", true);
			xhttp.setRequestHeader('x-access-token', token);
			xhttp.send();
		}
	},
	components: {
		'register': Register,
		'login': Login
	},
	template: `
	<div class="auth">
		<input type="button" value="logout" v-if="useDefaultLogoutButton == true && tokenIsValid == true" v-on:click="logout">
		<div class="auth-modal" v-if="displayModal == true">

			<div class="auth-modal__overlay">
				
			</div>

			<div class="auth-modal__content-wrap">
				<div class="auth-modal__content">
					<div class="auth-modal__content__tabs">
						<input class="button button5" v-if="displayLogin" type="button" value="Go to Registration" v-on:click="authDisplay('register')">
						<input class="button button5" v-if="displayRegister" type="button" value="Go to Login" v-on:click="authDisplay('login')">
					</div>

					<div class="auth-modal__content__form">
						<register v-if="displayRegister" v-on:token-updated="checkToken" v-on:cancel="cancelRegister"></register>
						<login v-if="displayLogin" v-on:token-updated="checkToken" v-on:cancel="cancelLogin"></login>
					</div>
				</div>
			</div>

		</div>
	</div>`
})

Vue.component('med-large-ribbon', {
	props: {
		parentRibbonInfo: Object,
		parentSiteNavItemsAction: Function,
		parentUserNavItemsAction: Function
	},
  	data: function() {
  		return {
  			ribbonInfo: this.parentRibbonInfo,
  			siteNavItems: this.parentRibbonInfo.siteNavItems,
  			userNavItems: this.parentRibbonInfo.userNavItems,
  			siteNavItemsAction: this.parentSiteNavItemsAction,
  			userNavItemsAction: this.parentUserNavItemsAction,

  			// Mobile tapping data
  			siteNavTapped: false,
  			userNavTapped: false,
  			lastTapped: null,
  			onlyOneActiveTap: true
  		}
	},
	methods: {
		toggleTapped: function(target, tapGroup) {
			if (!("ontouchstart" in document.documentElement)) {
				return;
		    }

			var currentTapped = tapGroup + "Tapped";

			// If only one active is allowed, untap previous tap
    		if (this.onlyOneActiveTap &&
    			this.lastTapped &&
    			this.lastTapped != currentTapped)
    		{
    			this[this.lastTapped] = false;
    		}

    		// Toggle the new tap
    		this.lastTapped = currentTapped;
			this[currentTapped] = !this[currentTapped];

		}
	},
	template: `
		<div class="site-ribbon">
			<a class="image-wrap site-ribbon__logo" href="/">
				<img src="/images/sample-logo.svg">
			</a>
			<div class="site-ribbon__navs">

				<nav class="inline-menu site-nav--inline">
					<div class="inline-menu__items">
					    <a v-for="item in siteNavItems" class="inline-menu__item" v-bind:href="item.link">{{ item.text }}</a>
					</div>
				</nav>

				<nav class="dropdown-menu dropdown-menu--right site-nav--dropdown"
				v-bind:class="{ tapped: siteNavTapped }"
				v-on:click="toggleTapped($event.currentTarget, 'siteNav')">
					<a class="icon icon1" href="#" v-bind:class="{ tapped: siteNavTapped }">
						<img src="/images/menu-ham.svg">
					</a>
					<div class="dropdown-menu__items">
					    <a v-for="item in siteNavItems" class="dropdown-menu__item" v-bind:href="item.link">{{ item.text }}</a>
					</div>
				</nav>

				<nav class="dropdown-menu dropdown-menu--right user-nav"
				v-bind:class="{ tapped: userNavTapped }"
				v-on:click="toggleTapped($event.currentTarget, 'userNav')">
					<a class="icon icon1" href="#" v-bind:class="{ tapped: userNavTapped }">
						<img v-bind:src="ribbonInfo.userIcon">
					</a>
					<div class="dropdown-menu__items">
					    <a v-for="(item, name) in parentRibbonInfo.userNavItems"
					    class="dropdown-menu__item"
					    v-bind:href="item.link"
					    v-on:click="userNavItemsAction(name)">{{ item.text }}</a>
					</div>
				</nav>

			</div>
		</div>`
})
Vue.component('small-ribbon', {
	props: {
		parentRibbonInfo: Object,
		parentSiteNavItemsAction: Function,
		parentUserNavItemsAction: Function
	},
  	data: function() {
  		return {
  			ribbonInfo: this.parentRibbonInfo,
  			siteNavItems: this.parentRibbonInfo.siteNavItems,
  			userNavItems: this.parentRibbonInfo.userNavItems,
  			siteNavItemsAction: this.parentSiteNavItemsAction,
  			userNavItemsAction: this.parentUserNavItemsAction,

  			// Mobile tapping data
  			siteNavTapped: false,
  			userNavTapped: false,
  			lastTapped: null,
  			onlyOneActiveTap: true
  		}
	},
	methods: {
		toggleTapped: function(target, tapGroup) {
			if (!("ontouchstart" in document.documentElement)) {
				return;
		    }

			var currentTapped = tapGroup + "Tapped";

			// If only one active is allowed, untap previous tap
    		if (this.onlyOneActiveTap &&
    			this.lastTapped &&
    			this.lastTapped != currentTapped)
    		{
    			this[this.lastTapped] = false;
    		}

    		// Toggle the new tap
    		this.lastTapped = currentTapped;
			this[currentTapped] = !this[currentTapped];

		}
	},
	template: `
		<div class="mobile-site-ribbon__navs">

			<nav class="dropdown-menu dropdown-menu--mobile mobile-site-nav"
			v-bind:class="{ tapped: siteNavTapped }"
			v-on:click="toggleTapped($event.currentTarget, 'siteNav')">
				<a class="icon icon1" href="#"
				v-bind:class="{ tapped: siteNavTapped }">
					<img src="/images/menu-ham.svg">
				</a>
				<div class="dropdown-menu__items">
				    <a v-for="item in siteNavItems" class="dropdown-menu__item" v-bind:href="item.link">{{ item.text }}</a>
				</div>
			</nav>

			<nav class="dropdown-menu dropdown-menu--mobile2 mobile-user-nav"
			v-bind:class="{ tapped: userNavTapped }"
			v-on:click="toggleTapped($event.currentTarget, 'userNav')">
				<a class="icon icon1" href="#"
				v-bind:class="{ tapped: userNavTapped }">
					<img v-bind:src="ribbonInfo.userIcon">
				</a>
				<div class="dropdown-menu__items">
				    <a v-for="(item, name) in userNavItems"
				    class="dropdown-menu__item"
				    v-bind:href="item.link"
				    v-on:click="userNavItemsAction(name)">{{ item.text }}</a>
				</div>
			</nav>

		</div>`
})

Vue.component('da-profile', {
	props: {
		parentAuth: Object
	},
  	data: function() {
  		return {
  			// current Auth
  			auth: this.parentAuth,

  			// data
  			userName: "",
  			userEmail: "",

  			// Mobile tapping data
  			siteNavTapped: false,
  			userNavTapped: false,
  			lastTapped: null,
  			onlyOneActiveTap: true
  		}
	},
	computed: {
		authTokenValid() {
			return this.auth.isTokenValid;
		}
	},
	watch: {
		authTokenValid: function() {
			this.getUserInfo();
		}
	},
	created: function() {
		this.getUserInfo();
	},
	methods: {
		getUserInfo: function(target, tapGroup) {

			// Check if a token exists
			var token = this.auth.getTokenFunction();
			if (!token) {
				this.userName = '';
				this.userEmail = '';
				return;
			}

			// If token exists attempt to validate
			var vueContext = this;
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (this.readyState == 4) {
					var responseObj = JSON.parse(this.responseText);

					if (false == responseObj.auth) {
						alert("Not authorized to view this page");
					}

					if (this.status == 200 && true == responseObj.auth) {
						vueContext.userName = responseObj.user.name;
						vueContext.userEmail = responseObj.user.email;
					} else {
						alert("Error: " + this.responseText);
					}

					console.log(responseObj);
				}
			};
			xhttp.open("GET", "/api/auth/me", true);
			xhttp.setRequestHeader('x-access-token', token);
			xhttp.send();
		}
	},
	template: `
		<div>
			<div v-if="!authTokenValid">
				<h1>Please Login</h1>
			</div>
			<div v-if="authTokenValid">
				<h1>Welcome {{ userName }}!</h1>

				<span>Email:</span><span>{{ userEmail }}</span>
			</div>
		</div>`
})


Vue.component('da-chat', {
	props: {
		parentAuth: Object
	},
  	data: function() {
  		return {
  			// current Auth
  			auth: this.parentAuth,

  			// data
  			interval: null,
  			messages: [],
  			newMessage: "",
  			enableNewMessage: false,
  			scroller: null,
  			autoScroll: true,

  			// Mobile tapping data
  			siteNavTapped: false,
  			userNavTapped: false,
  			lastTapped: null,
  			onlyOneActiveTap: true
  		}
	},
	computed: {
		authTokenValid() {
			return this.auth.isTokenValid;
		}
	},
	watch: {
		authTokenValid: function() {
			console.log("Chat.authIsTokenValid:" + this.authTokenValid)
			this.enableNewMessage = this.authTokenValid;
		}
	},
	created: function() {
		this.getMessagesInfo();
    	this.interval = setInterval(() => this.getMessagesInfo(), 1000);
	},
	methods: {
		setMessages: function(messages) {
			this.messages = messages;

			if (this.autoScroll) {
				var height = this.$refs["scroller"].scrollHeight - this.$refs["scroller"].clientHeight;
				this.$refs["scroller"].scrollTo(0, height);
			}

		},
		getMessagesInfo: function(target, tapGroup) {

			var vueContext = this;
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (this.readyState == 4) {
					var responseObj = JSON.parse(this.responseText);

					if (false == responseObj.auth) {
						alert("Not authorized");
					}

					if (this.status == 200 && true == responseObj.auth) {
						vueContext.setMessages(responseObj.chat);
					} else {
						alert("Error: " + this.responseText);
					}
				}
			};
			xhttp.open("GET", "/api/chat/general", true);
			xhttp.send();
		},
		sendNewMessage: function(target, tapGroup) {

			var body = 'message=' + this.newMessage;

			// Check if a token exists
			var token = this.auth.getTokenFunction();
			if (!token) {
				this.newMessage = '';
				alert("Please Login");
				return;
			}

			// If token exists attempt to validate
			var vueContext = this;
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (this.readyState == 4) {
					var responseObj = JSON.parse(this.responseText);

					if (false == responseObj.auth) {
						alert("Not authorized");
					}

					if (this.status == 200 && true == responseObj.auth) {
						vueContext.getMessagesInfo();
						vueContext.newMessage = '';
					} else {
						alert("Error: " + this.responseText);
					}
				}
			};
			xhttp.open("POST", "/api/chat/general", true);
			xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhttp.setRequestHeader('x-access-token', token);
			xhttp.send(body);
		},
		scrolled: function(e) {
			var scroller = e.target;

			// Scrolled to the absolute bottom
			if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight) {
				this.autoScroll = true;
				return;
			}

			// Scrolled away from bottom
			this.autoScroll = false;
		}
	},
	template: `
		<div class="chat">
			<div class="chat__messages-wrap" v-on:scroll="scrolled" ref="scroller">
				<div class="chat__messages">
					<div class="chat__message" v-for="message in messages"><span class="chat__message__name">{{ message.name }}</span>: <span class="chat__message__message">{{ message.body }}</span></div>
				</div>
			</div>
			<div class="chat__compose">
				<textarea class="chat__compose-text" maxlength="1000" v-model="newMessage" :disabled="!enableNewMessage"></textarea>
				<div class="chat__compose__send" v-on:click="sendNewMessage">
					<span>SEND</span>
				</div>
			</div>
		</div>`
})

var app = new Vue({
	el: '#app',
	data: {
		ribbonInfo: {
			siteNavItems: {
				about: { text: "About", link: "/About", tapped: false },
				contact: { text: "Contact Us", link: "/Contact", tapped: false }
			},
			userNavItems: {
				login: { text: "Login", link: "#", tapped: false}
			},
			userIcon: "/images/gear.svg"
		},
		auth: {
			getTokenFunction: null,
			isTokenValid: false
		}
	},
	computed: {
		authIsTokenValid() {
			return this.auth.isTokenValid;
		}
	},
	watch: {
		authIsTokenValid: function() {
			console.log("App.authIsTokenValid:" + this.authIsTokenValid)
		}
	},
	methods: {
		tokenStatusChange: function(tokenIsValid) {

			this.auth.isTokenValid = tokenIsValid;

			if (tokenIsValid) {
				// Update Menu Icon
				this.ribbonInfo.userIcon = "/images/avatar.svg"

				// Remove items
				Vue.delete(this.ribbonInfo.userNavItems, "login");

				// Add items
				this.ribbonInfo.userNavItems["logout"] = { text: "Logout", link: "#"};
				this.ribbonInfo.userNavItems["profile"] = { text: "Profile", link: "/profile"};

			} else if (!tokenIsValid) {
				// Update Menu Icon
				this.ribbonInfo.userIcon = "/images/gear.svg"

				// Remove items
				Vue.delete(this.ribbonInfo.userNavItems, "logout");
				Vue.delete(this.ribbonInfo.userNavItems, "profile");

				// Add items
				this.ribbonInfo.userNavItems["login"] = { text: "Login", link: "#"};
			}
		},
		userNavItemsAction: function(key) {
			if ("login" == key) {
				this.$refs.auth.displayModal = true;
			} else if ("logout" == key) {
				this.$refs.auth.logout();
			}
		},
		siteNavItemsAction: function(key) {
			/* No actions yet */
		},
		setGetTokenFunction: function(getTokenFunction) {
			this.auth.getTokenFunction = getTokenFunction;
		},
		getToken: function() {
			return this.auth.getTokenFunction();
		}
	}
})
