$.fn.checkForm = function(options) {

	return this.each(function() {

		var $form = $(this);

		$form.data('status', 'errors');

		$form.find(':input[data-required]').each(function() {
			if ($(this).attr('name') == undefined) $(this).attr('name', this.id);
		});

		var $inputs = $form.find('input:text[data-required]'),
				$textarea = $form.find('textarea[data-required]'),
				$submit = $form.find(':submit');

		var email = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
		// phone matches +7 (916) 998-56-70, 8 (912) 268-54-40
		//var phone = /^((8|\+7)?[ ][\(]{1}[0-9]{3}[\)]{1}[ ]{1}[0-9]{3}[\-]{1}[0-9]{2}[\-]{1}[0-9]{2})$/;
		//var phone = /^\+?(\d|\(|\)|-|\s)*\.?\d*$/; // пример: +7 905 123 45 67 или 8 (495) 345-67-89, плюсы, дефисы, пробелы и скобки разрешены
		var phone = /([\+0-9])$/;

		function appendNotice(obj, msg) {
			$(obj).closest('.label').addClass('error').find('var').remove();
			$(obj).closest('.label').append('<var>' + msg + '</var>');
		}

		// удаление сообщения об ошибке
		function removeNotice(obj) {
			$(obj).closest('.label').removeClass('error');
			$(obj).closest('.label').find('var').remove();
		}

		// проверка пустых полей
		function checkFields(obj, msg) {
			$(obj).each(function() {
				var val = $(this).val(),
					required = $(this).data('required');
				val = val.replace(/^\s*|\s*$/g, '').replace(/\s+/g, ' ');
				var slug = /\/+/g;

				if ( val === '' ) {
					msg = 'Пожалуйста, заполните это поле!';
					appendNotice(this, msg);

				} else {
					if ( $(this).val().match(slug) ) {
						msg = 'Вот этого не надо!';
						appendNotice(this, msg);
					}
					if (required === 'phone' && !phone.test(val)) {
						msg = 'Пожалуйста, будьте внимательны!';
						appendNotice(this, msg);
					}
					if (required === 'email' && !email.test(val)) {
						msg = 'Пожалуйста, введите корректный email!';
						appendNotice(this, msg);
					}
				}
			});
		}

		$inputs.on('focus', function() { // keyup
			removeNotice(this);
		}).on('blur', function() {
			checkFields(this);
		});

		$textarea.on('focus', function() { // keyup
			removeNotice(this);
		}).on('blur', function() {
			checkFields(this);
		});

		function checkHidden(obj) {
			$(obj).each(function() {
				if (this.value == '') {
					$(this).addClass('error');
				} else {
					$(this).removeClass('error');
				}
			});
		}

		//$form.find(':submit').attr({'disabled':'true', 'value':'Заполните форму...' });

		$form.on('click', ':submit', function(event) {
			checkFields($inputs);
			checkFields($textarea);
			var errors = $form.find('.error').length;

			if ( errors ) {
				console.warn( 'ошибок: ' + errors );
				$form.data('status', 'errors');
				event.preventDefault();
			} else {
				$form.data('status', 'success');
				$form.trigger('submit');
				//return true;
			}

		});

	});
};
