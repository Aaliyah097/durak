from pydantic import BaseModel
from enum import Enum


class StateEnum(str, Enum):
    deck = "deck"
    drop = "drop"
    opponent = "opponent"
    hand = "hand"


class Nominal(BaseModel):
    value: int
    name: str


class Sign(BaseModel):
    icon: str
    color: str
    name: str


class Card(BaseModel):
    pk: int
    state: StateEnum = "deck"
    nominal: Nominal
    sign: Sign


class CardsCollection:
    signs = [
        Sign(color="r", name="diamonds", icon="signs/diamonds.png"),
        Sign(color="r", name="hearts", icon="signs/hearts.png"),
        Sign(color="b", name="spades", icon="signs/spades.png"),
        Sign(color="b", name="clubs", icon="signs/clubs.png")
    ]
    nominals = [
        Nominal(value=6, name="6"),
        Nominal(value=7, name="7"),
        Nominal(value=8, name="8"),
        Nominal(value=9, name="9"),
        Nominal(value=10, name="10"),
        Nominal(value=11, name="J"),
        Nominal(value=12, name="Q"),
        Nominal(value=13, name="K"),
        Nominal(value=14, name="A"),
    ]

    def __init__(self):
        self._cards: list[Card] = []
        counter = 1

        for nominal in self.nominals:
            for sign in self.signs:
                self._cards.append(
                    Card(
                        pk=counter,
                        nominal=nominal,
                        sign=sign
                    )
                )
                counter += 1

    @property
    def cards(self):
        return self._cards

