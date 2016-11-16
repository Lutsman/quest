
/*BlockToggler*/
(function(){
    function BlockToggler(options) {
        this._block = options.block;
        this._target = $(this._block).attr('data-target');
        this._getTarget = options.getTarget || null; //func, arg: this._block, return: target
        this._groupName = $(this._block).attr('data-group-name');
        this._isActive = false;
        this._animate = options.animate || 'simple';  // 'none', 'simple', 'slide', 'fade'
        this._onOpen = options.onOpen || null;
        this._onClose = options.onClose || null;
        this._onAfterOpen = options.onAfterOpen || null;
        this._onAfterClose = options.onAfterClose || null;
    }
    BlockToggler.prototype.init = function () {
        if (!this._target && typeof this._getTarget === 'function') {
            this._target = this._getTarget(this._block);
        }
        
        //if (!this._target) return; //if still no target stop init func
    
        var throttledToggler = this.throttle(this.toggler, 405);
        
        $(this._block).on('click', throttledToggler.bind(this));
        
        $('body').on({
            'openBlock': this.openBlockListener.bind(this),
            'closeGroup': this.closeGroupListener.bind(this)
        });
    };
    BlockToggler.prototype.toggler = function (e) {
        e.preventDefault();
        
        if (this._isActive) {
            this.hideBlock(function () {
                $(this._block).removeClass('active');
                
                if (this._onAfterClose) {
                    this._onAfterClose(this);
                }
            }.bind(this));
            
            $(this._block).trigger('blockClose', [this._block, this._groupName]);
            
            if (this._onClose) {
                this._onClose(this);
            }
        } else {
            $(this._block).addClass('active');
            this.showBlock(function () {
                if (this._onAfterOpen) {
                    this._onAfterOpen(this);
                }
            }.bind(this));
            
            $(this._block).trigger('openBlock', [this._block, this._groupName]);
            
            if (this._onOpen) {
                this._onOpen(this);
            }
        }
    };
    BlockToggler.prototype.openBlockListener = function (e, block, groupName) {
        var conditions = block !== this._block && groupName === this._groupName && groupName !== undefined;
        
        if ((this._block.classList.contains('active') && conditions) || ($(this._target).is(':visible') && conditions)) {
            $(this._block).removeClass('active');
            this.hideBlock(this._onAfterClose(this));
            
            if (this._onClose) {
                this._onClose(this);
            }
            return;
        }
        
        if ( !conditions || !this._isActive) return;
        
        $(this._block).removeClass('active');
        this.hideBlock(this._onAfterClose);
        
        if (this._onClose) {
            this._onClose(this);
        }
    };
    BlockToggler.prototype.closeGroupListener = function (e, groupName) {
        if (groupName !== this._groupName || groupName === undefined || !this._isActive) return;
        
        this.hideBlock(function () {
            $(this._block).removeClass('active');
            
            if (this._onAfterClose) {
                this._onAfterClose(this);
            }
        }.bind(this));
        
        $(this._block).trigger('blockClose', [this._block, this._groupName]);
        
        if (this._onClose) {
            this._onClose(this);
        }
    };
    BlockToggler.prototype.showBlock = function (callback) {
        var target = this._target;
        callback = callback || function () {};
        
        switch (this._animate) {
            case 'none':
                callback(this);
                break;
            case 'simple':
                $(target).show();
                callback(this);
                break;
            case 'slide':
                if (!target) {
                    callback(this);
                } else {
                    $(target).slideDown('normal', 'linear', callback);
                }
                break;
            case 'fade':
                if (!target) {
                    callback();
                } else {
                    $(target).fadeIn('normal', 'linear', callback);
                }
                break;
        }
        
        this._isActive = true;
    };
    BlockToggler.prototype.hideBlock = function (callback) {
        var target = this._target;
        
        switch (this._animate) {
            case 'none':
                if (typeof callback === 'function') callback();
                break;
            case 'simple':
                $(target).hide();
                if (typeof callback === 'function') callback();
                break;
            case 'slide':
                $(target).slideUp('normal', 'linear', callback);
                break;
            case 'fade':
                $(target).fadeOut('normal', 'linear', callback);
                break;
        }
        this._isActive = false;
    };
    BlockToggler.prototype.throttle = function (func, ms) {
        
        var isThrottled = false,
            savedArgs,
            savedThis;
        
        function wrapper() {
            
            if (isThrottled) { // (2)
                savedArgs = arguments;
                savedThis = this;
                return;
            }
            
            func.apply(this, arguments); // (1)
            
            isThrottled = true;
            
            setTimeout(function() {
                isThrottled = false; // (3)
                if (savedArgs) {
                    wrapper.apply(savedThis, savedArgs);
                    savedArgs = savedThis = null;
                }
            }, ms);
        }
        
        return wrapper;
    };
    
    $.fn.blockToggler = function () {
        var options = typeof arguments[0] === 'object' ? arguments[0] : {};
        
        $(this).each(function () {
            options.block = this;
            
            var currBlockToggler = new BlockToggler(options);
            currBlockToggler.init();
        });
    }
})();

$(document).ready(function () {
    /*menu*/
    (function(){
        var $navPanels = $('[data-group-name^="nav-level"]');
        var $backBtn = $('[data-action="back"]');
        var $resetBtn = $('[data-action="reset-nav"]');
        var oneTimeFunc = oneTimeStart();
        
        $navPanels.blockToggler({
            animate: 'slide',
            getTarget: getUl,
            onOpen: function (togglerObj) {
                extraTogglerMeth(togglerObj);
                oneTimeFunc(togglerObj);
            },
            onAfterClose: extraTogglerMeth
        });
        $backBtn.on('click', getBack);
        $resetBtn.on('click', resetNav);
        
        
        function getUl(block) {
            return $(block).parent().children('ul');
        }
    
        function extraTogglerMeth (togglerObj) {
            var togglerGroup = $(togglerObj._block).attr('data-group-name');
            var $simillarTogglers = $('[data-group-name="' + togglerGroup + '"]');
            var prevLevelGroup = togglerGroup.slice(0, -1) + (parseInt(togglerGroup.slice(-1)) - 1);
            var $backBtn = $('[data-action="back"][data-target="' + prevLevelGroup + '"]');
            
            //console.log(prevLevelGroup);
            //console.log($backBtn);
            
            if (togglerObj._isActive) {
                $simillarTogglers.hide();
                $backBtn.hide();
            } else {
                $simillarTogglers.show();
                $backBtn.show();
            }
        }
    
        function oneTimeStart() {
            var doneArr = [];
            
            return function (togglerObj) {
                if (~doneArr.indexOf(togglerObj._block)) return;
                
                $('.menu-slider', $(togglerObj._target)).slick('setPosition');
                doneArr.push(togglerObj._block);
            };
        }
    
        function getBack(e) {
            e.preventDefault();
            
            var $self = $(this);
            var togglerGroup = $self.attr('data-target');
            
            $self.trigger('closeGroup', [togglerGroup]);
        }
    
        function resetNav () {
            var groupLevel2 = 'nav-level-2';
            var groupLevel3 = 'nav-level-3';
            var $self = $(this);
    
            if ($self.attr('aria-expanded') === 'true') {
                $self.trigger('closeGroup', [groupLevel2]);
                $self.trigger('closeGroup', [groupLevel3]);
            }
        }
    })();
    
    /*slider*/
    (function(){
    	var $menuSlider = $('.menu-slider');
        var $gameSlider = $('.game-slider');
        
        $menuSlider.slick({
            arrows: false
        });
        
        $gameSlider.slick({
            arrows: false,
            adaptiveHeight: true,
            infinite: false
        });
    })();
});