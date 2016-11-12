
/*BlockToggler*/
(function(){
    function BlockToggler(options) {
        this._block = options.block;
        this._target = $(this._block).attr('data-target');
        this._getTarget = options.getTarget || null; //func, arg: this._block, return: target
        this._groupName = $(this._block).attr('data-group-name');
        this._isActive = false;
        this._animate = options.animate || 'slide';  // 'none', 'simple', 'slide', 'fade'
        this._onOpen = options.onOpen || null;
        this._onClose = options.onClose || null;
        this._onAfterOpen = options.onAfterOpen || null;
        this._onAfterClose = options.onAfterClose || null;
    }
    BlockToggler.prototype.init = function () {
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
        if(this._block.classList.contains('active') && block !== this._block) {
            $(this._block).removeClass('active');
            this.hideBlock();
            return;
        }
        
        if($(this._getTarget(this._block)).is(':visible') && block !== this._block) {
            $(this._block).removeClass('active');
            this.hideBlock();
            return;
        }
        
        if (block === this._block || groupName !== this._groupName || groupName === undefined || !this._isActive) return;
        
        $(this._block).removeClass('active');
        this.hideBlock();
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
        
        if (!this._target && typeof this._getTarget === 'function') {
            target = this._getTarget(this._block);
        }
        
        switch (this._animate) {
            case 'none':
                if (typeof callback === 'function') callback();
                break;
            case 'simple':
                $(target).show();
                if (typeof callback === 'function') callback();
                break;
            case 'slide':
                $(target).slideDown('normal', 'linear', callback);
                break;
            case 'fade':
                $(target).fadeIn('normal', 'linear', callback);
                break;
        }
        
        this._isActive = true;
    };
    BlockToggler.prototype.hideBlock = function (callback) {
        var target = this._target;
        
        if (!this._target && typeof this._getTarget === 'function') {
            target = this._getTarget(this._block);
        }
        
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
    	var $navLevel2 = $('ul.nav.navbar-nav > li');
        
        $na
    })();
    
    
});