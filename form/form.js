/*Form*/
(function(){
    function FormController(options) {
        this._submitSelector = options.submitSelector || 'input[type="submit"]';
        this._listenedBlock = options.listenedBlock || 'body';
        this._resetForm = options.resetForm || true;
        this._beforeSend = options.beforeSend || null;
        this._resolve = options.resolve || null;
        this._reject = options.reject || null;
        this._maxFileSize = options.maxFileSize || 2; //MB
    }
    FormController.prototype.init = function () {
        if(!document.querySelector(this._submitSelector)) return;

        $(this._listenedBlock).click(this.formListeners.bind(this));

        if($(this._listenedBlock).find('input[type="file"]').length) {
            $(this._listenedBlock).change(this.uploadListener.bind(this));
        }
    };
    FormController.prototype.validateForm = function (form) {
        var vResult = true;
        var passCurr = false;
        var self = this;

        $('input[name!="submit"], textarea', $(form)).each(function () {
            var vVal = $(this).val();
            var requiredField = $(this).attr('required');
            var pattern = '';
            var placeholderMess = '';

            $(this).removeClass('form-fail'); //чистим классы, если остались после прошлого раза
            $(this).removeClass('form-success');


            if (vVal.length === 0 && requiredField) {
                placeholderMess = 'Поле ' + ($(this).attr('data-validate-empty') ? '"' + $(this).attr('data-validate-empty') + '" ' : '') + 'обязательное!';
                vResult = false;
            } else if ($(this).attr('name') == 'email' && vVal.length) {
                pattern = /^([a-z0-9_\.-])+@[a-z0-9-]+\.([a-z]{2,4}\.)?[a-z]{2,4}$/i;

                if (pattern.test($(this).val())) {
                    $(this).addClass('form-success');
                } else {
                    placeholderMess = 'Введите корректный E-mail!';
                    vResult = false;
                }
            } else if ($(this).attr('name') == 'phone' && vVal.length) {
                pattern = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/i;

                if (pattern.test($(this).val())) {
                    $(this).addClass('form-success');
                } else {
                    placeholderMess = 'Введите корректный телефон!';
                    vResult = false;
                }
            } else if ($(this).attr('name') === 'passCurr' && vVal.length) {
                passCurr = this;
            } else if ($(this).attr('name') === 'passNew' && vVal.length) {
                if (vVal === $(passCurr).val()) {
                    $(passCurr).val('').addClass('form-fail').attr('placeholder', 'Новый пароль, не должен совпадать с текущим!');
                    placeholderMess = 'Новый пароль, не должен совпадать с текущим!';
                } else {
                    $(this).addClass('form-success');
                    $(passCurr).addClass('form-success');
                }
            }else if($(this).is('textarea') && vVal.length < 10 && vVal.length > 0  && requiredField) {
                placeholderMess = 'Сообщение слишком короткое!';
                vResult = false;
            } else if (requiredField && vVal.length) {
                $(this).addClass('form-success');
            }

            if (placeholderMess) {
                $(this).attr('data-old-placeholder', $(this).attr('placeholder'));
                $(this).val('').attr('placeholder', placeholderMess).addClass('form-fail');
                placeholderMess = '<span class="form-fail">' + placeholderMess + '</span>';
                self.changeLabel(this, placeholderMess, 'span.placeholder');
            }
        });

        return vResult;
    };
    FormController.prototype.uploadListener = function (e) {
        var elem = e.target;

        if(!elem.matches('input[type="file"]'))  return;

        var size = this.getFileSize(elem);

        if (size < this._maxFileSize * 1024 * 1024) return;

        alert("Файл слишком большой. Размер вашего файла " + (size / 1024 / 1024).toFixed(2) +
            " MB. Загружайте файлы меньше " + this._maxFileSize + "MB.");
        $(elem).val('');
    };
    FormController.prototype.getFileSize = function (input) {
        var file;

        if (typeof ActiveXObject == "function") { // IE
            file = (new ActiveXObject("Scripting.FileSystemObject")).getFile(input.value);
        } else {
            file = input.files[0];
        }

        return file.size;
    };
    FormController.prototype.changeLabel = function (elem, val, insideLabelSelector) {
        var selector = 'label[for="' + $(elem).attr('id') + '"] ' + insideLabelSelector || '';
        var $label = $(selector);

        if ($label.length) {
            $label.each(function () {
                this.innerHTML = val;
            });
        }
    };
    FormController.prototype.resetForms = function (formContainer) {
        var $form;
        var self = this;

        if (formContainer.tagName === 'FORM') {
            $form = $(formContainer);
        } else {
            $form = $('form', $(formContainer));
        }

        $form.each(function () {
            self.resetPlaceholders(this);
            if (self._resetForm) {
                this.reset();
                self.triggerChange(this);
            }
        });
    };
    FormController.prototype.resetPlaceholders = function (inputContainer) {
        var self = this;
        var $input;

        if (inputContainer.tagName === 'INPUT') {
            $input = $(inputContainer);
        } else {
            $input = $('input[name != submit]', $(inputContainer));
        }

        $input.each(function () {
            var name = $(this).attr('name');
            var placeholderMess =  $(this).attr('data-old-placeholder');

            $(this).removeClass('form-success');
            $(this).removeClass('form-fail');

            if (!placeholderMess) return;

            $(this).attr('placeholder', placeholderMess);
            self.changeLabel(this, placeholderMess, 'span.placeholder');
        });
    };
    FormController.prototype.triggerChange = function (inputContainer) {
        var $input = null;

        if (inputContainer.tagName === 'INPUT') {
            $input = $(inputContainer);
        } else {
            $input = $('input[name != submit]', $(inputContainer));
        }

        $input.each(function () {
            $(this).trigger('change');
        });
    };
    FormController.prototype.formListeners = function (e) {
        var elem = e.target;

        if (!elem.matches(this._submitSelector)) return;

        e.preventDefault();

        var form = elem.closest('form');

        if (this.validateForm(form)) {
            this.sendRequest(form, this._resolve, this._reject, this._beforeSend);
        }
    };
    FormController.prototype.sendRequest = function (form, resolve, reject, beforeSend) {
        var formData = $(form).serializeArray(); //собираем все данные из формы
        var self = this;


        if (beforeSend) {
            beforeSend.call(this, formData, form);
        }
        //console.dir(formData);

        this.showPending(form);

        $.ajax({
            type: form.method,
            url: form.action,
            data: $.param(formData),
            success: function (response) {
                //console.log(response);

                if (response) {
                    self.hidePending(form, self.showSuccess.bind(self, form));

                    if (resolve) {
                        resolve.call(self, form, response);
                    }
                } else {
                    self.hidePending(form, self.showError.bind(self, form));

                    if (reject) {
                        reject.call(self, form, response);
                    }
                }

                self.resetForms(form);
            },
            error: function (response) {

                //console.log(response);
                //throw new Error(response.statusText);
                self.hidePending(form, self.showError.bind(self, form));
                self.resetForms(form);

            }
        });
    };
    FormController.prototype.showError = function (form) {
        var $errBlock = $('.err-block', $(form));

        $('.form-success', $(form)).removeClass('form-success');
        $errBlock.fadeIn('normal');

        setTimeout(function () {
            $errBlock.fadeOut('normal');
        }, 10000);
    };
    FormController.prototype.showSuccess = function (form) {
        var $succBlock = $('.succ-block', $(form));

        $('.form-success', $(form)).removeClass('form-success');
        $succBlock.fadeIn('normal');

        setTimeout(function () {
            $succBlock.fadeOut('normal');
        }, 10000);
    };
    FormController.prototype.showPending = function (form) {
        var $pendingBlock = $('.pend-block', $(form));

        $pendingBlock.fadeIn('normal');
    };
    FormController.prototype.hidePending = function (form, callback) {
        var $pendingBlock = $('.pend-block', $(form));

        if (!$pendingBlock[0]) {
            callback();
            return;
        }

        $pendingBlock.fadeOut('normal', 'linear', callback);
    };

    var anyForm = new FormController({});
    anyForm.init();
})();