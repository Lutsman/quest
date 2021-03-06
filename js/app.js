
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

/*lightbox Class*/
(function(){
    function LightBox(options) {
        //this._listenedBlock = options.listenedBlock || document.body;
        //this._lightbox = options.lighbox || '[data-component="lighbox"]';
        this._opener = options.opener; //|| '[data-role="openLighbox"]';
        this._closer = options.closer || '[data-role="close"]';
        this._modal = options.modal || '[data-role="modal"]';
        this._isOverlay = options.isOverlay === undefined;
        this._overlay = '[data-role="overlay"]';
        this._overlayClass = options.overlayClass || 'lighbox-overlay';
        this._animate = options.animate || 'fade';
        this._targetAttr = options.targetAttr || 'data-target';
        this._onOpen = options.onOpen || null;
        this._onClose = options.onClose || null;
        this._onAfterOpen = options.onAfterOpen || null;
        this._onAfterClose = options.onAfterClose || null;
    }
    LightBox.prototype.init = function () {
        $(this._opener).on('click', this.openHandler.bind(this));
    };
    LightBox.prototype.show = function () {
        if (!this._activeModal.length) return;

        var onOpen = typeof this._onOpen === 'function' ? this._onOpen: function (){};
        var onAfterOpen = typeof this._onAfterOpen === 'function' ? this._onAfterOpen: function (){};

        switch (this._animate) {
            case 'simple':
                onOpen();
                this._activeModal.show();
                onAfterOpen();
                break;
            case 'slide':
                onOpen();
                this._activeModal.slideDown(null, null, onAfterOpen);
                break;
            case 'fade':
                onOpen();
                this._activeModal.fadeIn(null, null, onAfterOpen);
                break;
        }
    };
    LightBox.prototype.hide = function () {
        if (!this._activeModal || !this._activeModal.length) return;

        var onClose = typeof this._onClose === 'function' ? this._onClose: function (){};
        var onAfterClose = typeof this._onAfterClose === 'function' ? this._onAfterClose: function (){};

        switch (this._animate) {
            case 'simple':
                onClose();
                this._activeModal.hide();
                onAfterClose();
                this.stripModal();
                break;
            case 'slide':
                onClose();
                this._activeModal.slideUp(null, null, function () {
                    onAfterClose();
                    this.stripModal();
                }.bind(this));
                break;
            case 'fade':
                onClose();
                this._activeModal.fadeOut(null, null, function () {
                    onAfterClose();
                    this.stripModal();
                }.bind(this));
                break;
        }
    };
    LightBox.prototype.openHandler = function (e) {
        var target = this._opener.getAttribute(this._targetAttr) ?
            this._opener.getAttribute(this._targetAttr) :
            this._opener.getAttribute('href');
        
        if (!document.body.querySelector(target)) return;
        e.preventDefault();
    
        this.renderModal(target);
        this.show();
    };
    LightBox.prototype.closeHandler = function (e) {
        var elem = e.target;
        
        if (!(elem.closest(this._closer) || elem.matches(this._overlay))) return;
        e.preventDefault();
        //console.log(e.target);
        
        this.hide();
    };
    LightBox.prototype.renderModal = function (target) {
        var $target = $(target);

        if (!$target.length) return;
    
        var $overlay = $target.closest(this._overlay);
        //var closeSelectors = [this._closer];

        //console.log(this._isOverlay);
        if (this._isOverlay) {
            if (!$overlay.length){
                $overlay = $('<div data-role="overlay"></div>');
                $overlay.addClass(this._overlayClass);
                $target.wrap($overlay)
                    .show()
                    .attr('data-role', 'modal');
                
                $overlay = $target.closest(this._overlay);
            }
            
            this._activeModal = $overlay;
            //closeSelectors.push(this._overlay);
        } else {
            this._activeModal = $target;
        }

        //this._closeSelectors = closeSelectors.join(', ');

        //console.log(this._closeSelectors);
        //console.log(this._activeModal);
        
        this._activeModal.on('click', this.closeHandler.bind(this));
    };
    LightBox.prototype.stripModal = function () {
        //console.log(this._activeModal);
        if (!this._activeModal) return;

        this._activeModal.off('click');
    
        if (this._isOverlay) {
            //var $modal =  this._activeModal.find(this._modal);
            this._activeModal.find(this._modal)
                .hide()
                .unwrap()
                .removeAttr('data-role');
        }
        
        this._activeModal = null;
        //this._closeSelectors = '';
    };
    
    
    $.fn.lightBox = function () {
        var options = typeof arguments[0] === 'object' ? arguments[0] : {};
        
        $(this).each(function () {
            options.opener = this;
            
            var controller = new LightBox(options);
            controller.init();
        });
    };
})();

$(document).ready(function () {
    /*menu*/
    /*(function(){
        function TopMenuController() {
            this.init();
        }
        TopMenuController.prototype.init = function () {
            var $navPanels = $('[data-group-name^="nav-level"]');
            var $backBtn = $('[data-action="back"]');
            var $resetBtn = $('[data-action="reset-nav"]');
            var oneTimeFunc = this.oneTimeStart();
            var self = this;
    
            $navPanels.blockToggler({
                animate: 'slide',
                getTarget: self.getUl,
                onOpen: function (obj) {
                    self.extraTogglerMeth.apply(this, [obj]); //работает
                    oneTimeFunc.apply(this, [obj]);
                },
                onAfterClose: self.extraTogglerMeth
            });
            $backBtn.on('click', self.getBack);
            $resetBtn.on('click', self.resetNav);
        };
        TopMenuController.prototype.getUl = function (block) {
            return $(block).parent().children('ul');
        };
        TopMenuController.prototype.extraTogglerMeth = function (obj) {
            var togglerGroup = $(obj._block).attr('data-group-name');
            var $simillarTogglers = $('[data-group-name="' + togglerGroup + '"]');
            var prevLevelGroup = togglerGroup.slice(0, -1) + (parseInt(togglerGroup.slice(-1)) - 1);
            var $backBtn = $('[data-action="back"][data-target="' + prevLevelGroup + '"]');
        
            //console.log(prevLevelGroup);
            //console.log($backBtn);
        
            if (obj._isActive) {
                $simillarTogglers.hide();
                $backBtn.hide();
                //console.log('extra hide');
            } else {
                $simillarTogglers.show();
                $backBtn.show();
                //console.log('extra show');
            }
        };
        TopMenuController.prototype.oneTimeStart = function () {
            var doneArr = [];
        
            return function (obj) {
                if (~doneArr.indexOf(obj._block)) return;
            
                $('.menu-slider', $(obj._target)).slick('setPosition');
                doneArr.push(obj._block);
            };
        };
        TopMenuController.prototype.getBack = function (e) {
            e.preventDefault();
        
            var $self = $(this);
            var togglerGroup = $self.attr('data-target');
        
            $self.trigger('closeGroup', [togglerGroup]);
        };
        TopMenuController.prototype.resetNav = function () {
            var groupLevel2 = 'nav-level-2';
            var groupLevel3 = 'nav-level-3';
            var $self = $(this);
        
            if ($self.attr('aria-expanded') === 'true') {
                $self.trigger('closeGroup', [groupLevel2]);
                $self.trigger('closeGroup', [groupLevel3]);
            }
        };
        
        var menuController = new TopMenuController();
    })();*/
    
    /*slider*/
    /*(function(){
        /!*menu-slider*!/
        (function(){
            var $menuSlider = $('.menu-slider');
    
            $menuSlider.slick({
                arrows: false
            });
        })();
        
        /!*content slider*!/
        (function(){
            var s = $gameSlider = $('.content-slider');
            var nextAttr = '[data-action="next"]';
            var prevAttr = '[data-action="prev"]';
            var filterAttr = '[data-action="filter"]';
            var allowAttr = 'data-allow';
            var disallowAttr = 'data-disallow';
            var $answer = $('input[name="answer"]');
            var $footer = $('footer');
            var $submit = $('button[type="submit"]');
            var filters = {
                start: '.filter-start',
                game: '.filter-game-',
                waypoint: '.filter-waypoint-',
                desc: '.filter-description-',
                quest: '.filter-question-',
                hint: '.filter-hint-',
                true: '.filter-correct-',
                halfTrue: '.filter-almost-correct-',
                false: '.filter-incorrect-'
            };
            var permitableElements = {
                hint: {
                    permit: true,
                    link: '.btn-support',
                    isChanged: false
                },
                next: {
                    permit: true,
                    link: '.btn-next',
                    isChanged: false
                },
                submit: {
                    permit: true,
                    link: '.content-slider [type="submit"]',
                    isChanged: false
                }
            };
            var gameCount = 1;
            var currGameQuestionCount= 1;
            var currQuestion = 1;
            var gameStart = false;
            var currFilter = '';
            var stageIsChanged = false;
            
            
            
            
    
            //console.dir(s.slick.Slick.getSlick);
            //s.slick('getSlick');
            /!*$gameSlider.on('init', function (e, slickObj) {
                console.log('slick init');
                console.dir(slickObj);
                
                //slickObj.filterSlides('.start');
                /!*slickObj.filterSlides(function () {
                    //var slickObj = _.slick('getSlick');
                    console.log('slick filtered');
                    var attr = this.getAttribute('data-role');
    
                    //console.log(attr);
    
                    if (attr === 'start') {
                        return true;
                    }
    
                    return false;
    
                });*!/
                
                //$('.content-slider').slick('filterSlides', '.start');
                
                //slickObj.slickFilter
                
                
                /!*__.slick('slickFilter', function () {
                    //var slickObj = _.slick('getSlick');
                    console.log('slick filtered');
                    var attr = slickObj.$slides[0].attr('data-role');
            
                    console.log(attr);
            
                    if (attr === 'start') {
                        return true;
                    }
            
                    return false;
            
                });*!/
            });*!/
    
            
            
            
            $gameSlider.slick({
                arrows: false,
                adaptiveHeight: true,
                infinite: false
            });
    
            s.on('afterChange', filteringAfter);
            s.on('reInit', navPermitsController.bind(this, s));
            
            var slick = s.slick('getSlick');
            //console.dir(slick);
            $('footer, .content-slider').on('click', function (e) {
                var target = e.target;
                var noDisable = ':not(.disable)';
        
                if (target.closest(nextAttr + noDisable)) {
                    slick.next();
                }
                
                if (target.closest(prevAttr + noDisable)) {
                    slick.prev();
                }
                
                if (target.closest(filterAttr + noDisable)) {
                    var filter = filters[target.closest(filterAttr).getAttribute('data-filter')] + gameCount;
                    //console.log(filter);
                    setFilter(filter);
                }
            });
            $answer.on('click', onAnswer);
            $submit.on('click', onSubmit);
            
            
            
            /!*(function(){
                var $slider = $('.content-slider');
            	//console.log($gameSlider.slick('slickCurrentSlide'));
                //console.dir($gameSlider.slick('getSlick'));
                
                //console.dir(_.slick('getSlick'));
                
                $slider.on('init', function (slickObj) {
                    console.log('slick init');
                    $slider.slick('slickFilter', function () {
                        //var slickObj = _.slick('getSlick');
                        console.log('slick filtered');
                        var attr = slickObj.$slides[0].attr('data-role');
        
                        console.log(attr);
        
                        if (attr === 'start') {
                            return true;
                        }
        
                        return false;
        
                    });
                });
                $slider.on('afterChange', function () {
                    console.log('afterChange');
                });
            })();*!/
    
    
            function filteringAfter(e, slick, currSlide) {
                //console.dir(obj);
                //console.log(currSlide);
                var index = 0;
                
                navPermitsController(slick.$slider);
                
                if (!gameStart) {
                    gameStart = true;
                    currFilter = filters.game + gameCount;
                    index = currSlide - 1;
                    $footer.fadeIn();
                    stageIsChanged = true;
                }
    
                
                if (stageIsChanged) {
                    setFilter(currFilter, index);
                    stageIsChanged = false;
                }
                
                
                //console.log('afterChange');
                
               /!* s.slick('slickUnfilter');
                s.slick('slickFilter', function () {
                    //console.log('slick filtered');
                    var attr = this.getAttribute('data-role');
            
                    //console.log(attr);
            
                    if (attr === 'start') {
                        return true;
                    }
            
                    return true;
            
                });*!/
            }
    
            function setFilter(filter, index) {
                index = index || 0;
                var slick = s.slick('getSlick');
                //var goToFunc = goTo(index, s, true);
                
                
                
                //console.dir(slick);
                //console.log(goto);
                //console.log(index);
    
                //s.one('reInit', goToFunc);
                
                s.slick('slickUnfilter');
                s.slick('slickFilter', filter);
                slick.currentSlide = index;
                
                /!*setTimeout(function () {
                    slick.currentSlide = index + 2;
                    console.log(slick.currentSlide);
                    s.slick('goTo', index + 1);
                },1000);*!/
                
                //s.slick('goTo', index);
    
                
            }
    
            function goTo(index, s, noAnimate) {
                //console.log('wrapper');
                
                return function inner (e, slick) {
                    console.log('goto');
                    //slick.goTo(index, noAnimate);
                    //slick.$slider.off('reInit', inner);
                    //s.slick('goTo', +index);
                    /!*slick.changeSlide({
                     data: {
                     message: 'index',
                     index: parseInt(index)
                     }
                     }, noAnimate);*!/
                    //slick.currentSlide = 3;
                    //console.log(slick);
                    s.slick('goTo', index, noAnimate);
                    //s.off('reInit', inner);
                };
            }
    
            function getFilter() {
                
            }
    
            function navPermitsController(s) {
                var $activeSlide = s.find('.slick-active');
                //var allows = $activeSlide.attr(allowAttr).split(',');
                var disallows = $activeSlide.attr(disallowAttr);
                
                //console.log(disallows);
                //if (!disallows) return;
                
                //disallows = disallows.split(',');
                
                
                
                setPermits(disallows);
            }
    
            function setPermits(permits) {
                var $permitedElements = $('[data-permit-name]');
                
                $permitedElements.removeClass('disable');
                
                if (!permits) return;
    
                //permits = permits.split(',');
                
                permits.split(',').forEach(function (item) {
                    //console.log(item);
                    //var target = $permitedElements.find('[data-permit-name="' + item + '"]');
                    $permitedElements.each(function () {
                        //console.log(this.getAttribute('data-permit-name') === item);
                       if (this.getAttribute('data-permit-name') === item) {
                           $(this).addClass('disable');
                       }
                    });
                });
            }
    
            function onAnswer(e) {
                var target = e.target;
                var slide = target.closest('[data-disallow]');
                var attr = slide.getAttribute('data-disallow').split(',');
                var newAttr = attr.filter(function (name) {
                    return name !== 'submit';
                }).join(',');
                
                console.log(newAttr);
                slide.setAttribute('data-disallow', newAttr);
                
                setPermits(newAttr);
            }
            
            function onSubmit(e) {
                var target = e.target;
                var radio = target.closest('form').querySelector(':checked');
                e.preventDefault();
                
                if (!radio) return;
                
                var val = '' + radio.value;
                console.log(radio);
                console.log(val);
                
                setFilter(filters[val] + gameCount);
            }
        })();
        
        
    	
       
    })();*/
    
    /*lightbox*/
    (function(){
    	var $popUpNoOverlay = $('[data-role="openLighbox"]');
        var $popUpWithMapNoOverlay = $('[data-role="openLighbox&map"]');
        var $popUpWithOverlay = $('[data-role="openLighbox&overlay"]');
        var $login = $('[data-role="changeLightbox"]');

        
        $popUpNoOverlay.lightBox({
            isOverlay: false
        });

        $popUpWithMapNoOverlay.lightBox({
            isOverlay: false,
            onAfterOpen: mapInit()
        });

        $popUpWithOverlay.lightBox();

        $login.lightBox({
            isOverlay: false,
            onOpen: function () {
                $('#sing-in').fadeOut();
            },
            onClose: function () {
                $('#sing-in').fadeIn();
            }
        });

        function mapInit() {
            var isInit = false;

            return function () {
                if (isInit) return;
                
                var canvas = $(this).find('.map');
                //console.log(this);

                //var markers = [];
                var myLatlng = new google.maps.LatLng(canvas.attr("data-lat"), canvas.attr("data-long"));
                var map = new google.maps.Map(canvas[0], {
                    /*mapTypeId: google.maps.MapTypeId.ROADMAP,*/
                    zoom: parseInt(canvas.attr("data-zoom")),
                    center: myLatlng,
                    streetViewControl: false,
                    scaleControl: false,
                    panControl: false,
                    zoomControl: true,
                    zoomControlOptions: {
                        style: google.maps.ZoomControlStyle.BIG
                    }
                });

                var marker = new google.maps.Marker({
                    position: myLatlng,
                    map: map,
                    title: canvas.attr("data-name"),
                    draggable: false
                });

                google.maps.event.addListenerOnce(map, 'idle', function () { // решает проблемму с загрузкой второй карты на странице
                    google.maps.event.trigger(map, 'resize');
                });

                isInit = true;
            };
        }
    })();

    /*waipoint_map size*/
    (function(){
        var mapLink = document.querySelector('.waypoint__map');

        if(!mapLink) return;

        setSize(mapLink);

        window.addEventListener('resize', setSize.bind(null, mapLink));

        function setSize(elem) {
            elem.style.display = 'none';

            var parent = elem.parentElement;
            var parentStyles = getComputedStyle(parent);
            var parentHeight = parent.clientHeight - parseInt(parentStyles.paddingTop) - parseInt(parentStyles.paddingBottom);
            var calcHeight = parentHeight - parent.children[0].offsetHeight;

            elem.style.display = '';
            elem.style.height = calcHeight > 70 ? calcHeight + 'px' : '';

        }
    })();
        
    /*google maps*/
    (function(){

        var $mapCanvas = $('#map');

        if (!$mapCanvas.length) return;

        init($mapCanvas);

        function init (canvas) {
                //var markers = [];
                var myLatlng = new google.maps.LatLng(canvas.attr("data-lat"), canvas.attr("data-long"));
                var map = new google.maps.Map(canvas[0], {
                    /*mapTypeId: google.maps.MapTypeId.ROADMAP,*/
                    zoom: parseInt(canvas.attr("data-zoom")),
                    center: myLatlng,
                    streetViewControl: false,
                    scaleControl: false,
                    panControl: false,
                    zoomControl: true,
                    zoomControlOptions: {
                        style: google.maps.ZoomControlStyle.BIG
                    }
                });

                var marker = new google.maps.Marker({
                    position: myLatlng,
                    map: map,
                    title: canvas.attr("data-name"),
                    draggable: false
                });

                google.maps.event.addListenerOnce(map, 'idle', function () { // решает проблемму с загрузкой второй карты на странице
                    google.maps.event.trigger(map, 'resize');
                });
            }
    })();

    /*message block*/
    (function () {
        var messBlock = document.body.querySelector('.message-block');

        if (!messBlock) return;

        $('.message-block .btn-close').on('click', function (e) {
            e.preventDefault();
            $(this).parent('.message-block').fadeOut();
        });
    })();
});