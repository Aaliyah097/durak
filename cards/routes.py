from fastapi import APIRouter, HTTPException, status, Cookie, Response, Depends
from cards.cards import Card, CardsCollection, StateEnum
from typing import Annotated
from fastapi import Body
from fastapi.responses import RedirectResponse


cards_routers = APIRouter(
    prefix="/cards",
    tags=['cards']
)


users_collections = {
    0: []
}


async def get_user_collection(user_id: Annotated[int, Cookie()] = None) -> tuple[list[Card], int]:
    if not user_id or user_id not in users_collections:
        user_id = max([k for k in users_collections]) + 1
        cards = sorted(CardsCollection().cards, key=lambda c: c.sign.name)
        users_collections[user_id] = cards
    else:
        cards = users_collections[user_id]

    return cards, user_id


async def get_stats(user_cards: Annotated[tuple[list[Card], int], Depends(get_user_collection)] = None) -> dict:
    deck = len(list(filter(lambda c: c.state == 'deck', user_cards[0])))
    hand = len(list(filter(lambda c: c.state == 'hand', user_cards[0])))
    drop = len(list(filter(lambda c: c.state == 'drop', user_cards[0])))
    opponent = len(list(filter(lambda c: c.state == 'opponent', user_cards[0])))

    return {
        'deck': deck,
        'hand': hand,
        'drop': drop,
        'opponent': opponent
    }


@cards_routers.get("/", status_code=status.HTTP_200_OK)
async def list_cards(response: Response,
                     user_cards: Annotated[tuple[list[Card], int], Depends(get_user_collection)] = None) -> list[Card]:
    cards, user_id = user_cards[0], user_cards[1]
    response.set_cookie(key="user_id", value=str(user_id))
    return cards


@cards_routers.get("/stats", status_code=status.HTTP_200_OK)
async def get_stats(stats: Annotated[dict, Depends(get_stats)]) -> dict:
    return stats


@cards_routers.get("/reset", status_code=status.HTTP_302_FOUND, response_class=RedirectResponse)
async def reset_cards(user_cards: Annotated[tuple[list[Card], int], Depends(get_user_collection)] = None):
    for card in user_cards[0]:
        card.state = "deck"

    users_collections[user_cards[1]] = user_cards[0]

    return '/'


@cards_routers.post("/{pk}", status_code=status.HTTP_200_OK)
async def change_card_state(pk: int,
                            new_state: Annotated[StateEnum, Body()],
                            user_cards: Annotated[tuple[list[Card], int], Depends(get_user_collection)] = None) -> Card:
    cards = filter(lambda c: c.pk == pk, user_cards[0])
    try:
        card = next(cards)
    except RuntimeError:
        raise HTTPException(404, f"В колоде только {len(user_cards[0])} карт")

    card.state = new_state
    users_collections[user_cards[1]] = user_cards[0]

    return card
