/**
 * Class which controls the UI of the game.
 */
class GameController {
    static applyRouteBindings() {
        $('path, rect').hover(function () {
            const id = $(this).attr('data-town');
            if (id && id != 'mapTooltipWrapper') {
                const tooltip = $('#mapTooltip');
                tooltip.text(id);
                tooltip.css('visibility', 'visible');

            }
        }, function () {
            const tooltip = $('#mapTooltip');
            tooltip.text('');
            tooltip.css('visibility', 'hidden');
        });
    }

    static animateCurrency(amount: number, target) {
        // Check if animations have been disabled
        if (!Settings.getSetting('showCurrencyGainedAnimation').observableValue()) {
            return;
        }
        let pos;
        const targetVisible = $(`#${target}`).is(':visible');

        if ($(`#${target}`).offset() && targetVisible) {
            pos = $(`#${target}`).offset();
            pos.top -= 15;
        } else {
            pos = $('#gameTitle').offset();
            pos.top += 45;
            pos.left -= 100;
        }

        const left = ((Math.random() * ((pos.left + 25) - (pos.left - 25)) + (pos.left - 25))).toFixed(2);
        const place = amount.toString().length;
        let multi = 1;
        for (let i = 0; i < place; i++) {
            multi *= 10;
        }
        const ani = `<p style="z-index:50;position:absolute;left:${left}px;top:${pos.top}px; font-size:${10 + 0.5 * Math.log(amount)}px;">+${amount.toLocaleString('en-US')}</p>`;
        $(ani).prependTo('body').animate({
            top: 10,
            opacity: 0,
        }, 200 * Math.log(amount) + 1000, 'linear',
        function () {
            $(this).remove();
        });
    }

    static simulateKey(code: string, type = 'keydown', modifiers = {}) {
        const evtName = type.startsWith('key') ? type : `key${type}`;

        const event = document.createEvent('HTMLEvents') as KeyboardEvent;
        Object.defineProperties(event, {
            code: {value: code},
        });
        event.initEvent(evtName, true, false);

        for (const i in modifiers) {
            event[i] = modifiers[i];
        }

        document.dispatchEvent(event);
    }

    static bindToolTips() {
        $('[data-toggle="popover"]').popover();
        $('[data-toggle="tooltip"]').tooltip();


        (ko as any).bindingHandlers.tooltip = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                const local = ko.utils.unwrapObservable(valueAccessor()),
                    options = {};

                ko.utils.extend(options, ko.bindingHandlers.tooltip.options);
                ko.utils.extend(options, local);

                $(element).tooltip(options);


                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                    $(element).tooltip('dispose');
                });

                if (bindingContext.$data instanceof Plot) {
                    $(element).hover(function () {
                        $(this).data('to', setInterval(function () {
                            $(element).tooltip('hide')
                                .attr('data-original-title', FarmController.getTooltipLabel(bindingContext.$index()))
                                .tooltip('show');
                        }, 100));
                    }, function () {
                        clearInterval($(this).data('to'));
                    });
                }

            },
            options: {
                placement: 'bottom',
                trigger: 'click',
            },
        };
    }

    static addKeyListeners() {
        $(document).on('keydown', function (e) {
            // Ignore any of our controls if focused on an input element
            if (document.activeElement.localName == 'input') {
                return;
            }

            if (App.game.gameState === GameConstants.GameState.dungeon) {
                switch (e.code) {
                    case 'ArrowUp':
                    case 'KeyW':
                        DungeonRunner.map.moveUp();
                        break;
                    case 'ArrowLeft':
                    case 'KeyA':
                        DungeonRunner.map.moveLeft();
                        break;
                    case 'ArrowDown':
                    case 'KeyS':
                        DungeonRunner.map.moveDown();
                        break;
                    case 'ArrowRight':
                    case 'KeyD':
                        DungeonRunner.map.moveRight();
                        break;
                    case 'Space':
                        DungeonRunner.openChest();
                        DungeonRunner.startBossFight();
                        break;
                    default: // any other key (ignore)
                        return;
                }
                e.preventDefault();
            } else if (App.game.gameState === GameConstants.GameState.town) {
                if (e.code === 'Space') {
                    if (player.town().gym()) {
                        GymRunner.startGym(player.town().gym());
                    } else if (player.town().dungeon()) {
                        DungeonRunner.initializeDungeon(player.town().dungeon());
                    }
                    e.preventDefault();
                } else if ('gymList' in player.town()) {
                    const number = Number(e.key);
                    // Check if a number higher than 0 and less than total Gyms was pressed
                    if (number && number <= player.town().gymList().length) {
                        GymRunner.startGym(player.town().gymList()[number - 1]());
                    }
                }
            } else if (App.game.gameState === GameConstants.GameState.fighting) {
                // Simpler with key because +/= share a code
                switch (e.key) {
                    case '+':
                        MapHelper.moveToRoute(player.route() + 1, player.region);
                        break;
                    case '-':
                        MapHelper.moveToRoute(player.route() - 1, player.region);
                        break;
                    default: // any other key (ignore)
                        return;
                }
                e.preventDefault();
            }

        });

        $(document).on('keydown', function (e) {
            if (App.game.gameState === GameConstants.GameState.safari) {
                const dir = GameConstants.KeyCodeToDirection[e.code];
                if (dir) {
                    e.preventDefault();
                    Safari.move(dir);
                }
                if (e.code === 'Space') {
                    e.preventDefault();
                }
            }
        });

        $(document).on('keyup', function (e) {
            if (App.game.gameState === GameConstants.GameState.safari) {
                const dir = GameConstants.KeyCodeToDirection[e.code];
                if (dir) {
                    e.preventDefault();
                    Safari.stop(dir);
                } else if (e.code === 'Space') {
                    e.preventDefault();
                }
            }
        });
    }
}

$(document).ready(function () {
    $('#pokedexModal').on('show.bs.modal', PokedexHelper.updateList);
});

// when stacking modals allow scrolling after top modal hidden
$(document).on('hidden.bs.modal', '.modal', function () {
    $('.modal:visible').length && $(document.body).addClass('modal-open');
});
