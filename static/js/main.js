if (window.screen.width < 750){
    viewCards(4);
}
else{
    viewCards(9);
}
update_stats();

function viewCards(n_columns){
    $.ajax(
        {
            type: 'get',
            url: 'cards',
            async: true,
            contentType: 'application/json',
            success: function (data) {
                let cols_counter = 0;
                let row = getRow();

                if (n_columns < 9){
                    data.sort((a, b) => a.nominal.value - b.nominal.value);
                }

                data.forEach(card => {
                    let card_div = createCardEl(card);

                    let card_col = document.createElement("div");
                    card_col.setAttribute("class", n_columns < 9 ? "col-md-2" : "col-md-1");

                    card_col.appendChild(card_div);
                    row.appendChild(card_col);

                    cols_counter += 1
                    if (cols_counter % n_columns === 0){
                        document.getElementById("main").appendChild(row);
                        row = getRow();
                    }
                })
            },
            error: function (xhr, errmsg, err) {

            }
        }
    )
}

function update_stats(){
    $.ajax(
        {
            type: 'get',
            url: 'cards/stats',
            async: true,
            contentType: 'application/json',
            success: function (data) {
                let deck = document.getElementById("deck-stat");
                let hand = document.getElementById("hand-stat");
                let opponent = document.getElementById("opponent-stat");
                let drop = document.getElementById("drop-stat");

                deck.textContent = data.deck;
                hand.textContent = data.hand;
                opponent.textContent = data.opponent;
                drop.textContent = data.drop;
            },
            error: function (xhr, errmsg, err) {

            }
        }
    )
}


function createCardEl(card){
    let sign = document.createElement("img");
    sign.src = "static/" + card.sign.icon;
    sign.width = 24;
    sign.height = 24;

    let nominal = document.createElement("span");
    nominal.textContent = card.nominal.name;
    nominal.style.fontSize = "22px";

    let card_div = document.createElement("div");
    card_div.setAttribute('class', 'card');

    let card_inner = document.createElement("div");
    card_inner.setAttribute("class", "card-inner");
    card_inner.id = "card" + card.pk;

    let card_front = document.createElement("div");
    card_front.setAttribute("class", "card-front");

    let card_back = document.createElement("div");
    card_back.setAttribute("class", "card-back");

    card_front.appendChild(sign);
    card_front.appendChild(nominal);
    card_back.appendChild(getActionsEl(card));
    card_inner.appendChild(card_front);
    card_inner.appendChild(card_back);
    card_inner.style.backgroundColor = getColor(card);
    card_div.appendChild(card_inner);
    card_div.addEventListener('click', function() {
        flipCard(this);
    });

    return card_div
}

function getActionLabel(action){
    switch(action){
        case 'deck':
            return 'В колоде'
        case 'hand':
            return 'В руке'
        case 'opponent':
            return 'Оппонент'
        case 'drop':
            return 'Выбыли'
    }
}

function getActionsEl(card){
    let actionOptions = [
        "deck",
        "hand",
        "opponent",
        "drop"
    ];
    let buttonsContainer = document.createElement("div");
    buttonsContainer.style.width = "100%";

    actionOptions.forEach(function (option, index) {
      let actionButton = document.createElement("button");
      actionButton.type = "button";
      actionButton.name = "state";
      actionButton.textContent = getActionLabel(option);
      actionButton.style.backgroundColor = getColor(option);

      actionButton.addEventListener("click", function () {
            changeCardState(option, card.pk);
      });

      buttonsContainer.appendChild(actionButton);
      buttonsContainer.appendChild(document.createElement("br"));
    });

    return buttonsContainer
}

function changeCardState(new_state, card_pk){
    $.ajax(
        {
            type: 'post',
            url: 'cards/' + card_pk,
            async: true,
            contentType: 'application/json',
            data: JSON.stringify(new_state),
            success: function (data) {
                let prev_card = document.getElementById("card" + card_pk);
                prev_card.style.backgroundColor = getColor(data);
                update_stats();
            },
            error: function (xhr, errmsg, err) {

            }
        }
)
}

function getColor(card){
    let state = card.hasOwnProperty('state') ? card.state : card;

    if(state === "deck"){
        return "#eceaea";
    }
    else if(state === "drop"){
        return "#ef8f87";
    }
    else if(state === "opponent"){
        return "#FFD150";
    }
    else if(state === "hand"){
        return "#42A405";
    }
    else{
        return "#eceaea";
    }
}


function getRow(){
    let row = document.createElement("div");
    row.setAttribute("class", "row");
    return row
}


function flipCard(card) {
    card.classList.toggle('flipped');
}
