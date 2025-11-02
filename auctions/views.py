from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from .models import User, Listing, Bid, Comment

def index(request):
    listings = Listing.objects.filter(is_active=True)
    return render(request, "auctions/index.html", {
        "listings": listings
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")
    

#create new listings
@login_required
def create_listing(request):
    if request.method == "POST":
        listing = Listing(
            title=request.POST["title"],
            description=request.POST["description"],
            starting_bid=request.POST["bid"],
            image_url=request.POST["image"],
            category=request.POST["category"],
            owner=request.user
        )
        listing.save()
        return redirect("index")
    return render(request, "auctions/create.html")

#display page of listing
def listing_page(request, id):
    listing = Listing.objects.get(pk=id)
    bids = listing.bids.all()
    comments = listing.comments.all()
    is_owner = request.user == listing.owner
    is_winner = request.user == listing.winner
    error_message = None


    if request.method == "POST":
        if "bid" in request.POST:
            amount = float(request.POST["bid"])
            if amount > listing.highest_bid():
                Bid.objects.create(listing=listing, bidder=request.user, amount=amount)
            else:
                error_message = "Your bid must be higher than the current bid."

        elif "comment" in request.POST:
            Comment.objects.create(listing=listing, author=request.user, content=request.POST["comment"])

        elif "close" in request.POST and is_owner:
            listing.is_active = False
            listing.save()

            highest_bid = listing.bids.order_by("-amount").first()
            if highest_bid:
                listing.winner = highest_bid.bidder

            listing.save()


    return render(request, "auctions/listing.html", {
        "listing": listing,
        "bids": bids,
        "comments": comments,
        "is_owner": is_owner,
        "error_message": error_message,
        "is_winner": is_winner
    })
#watchlist adder and remover
@login_required
def toggle_watchlist(request, id):
    listing = Listing.objects.get(pk=id)
    
    if request.user in listing.watchers.all():
        listing.watchers.remove(request.user)
    else:
        listing.watchers.add(request.user)
        
    return redirect("listing", id=id)

#watchlist
@login_required
def watchlist_view(request):
    listings = request.user.watchlist.all()
    return render(request, "auctions/watchlist.html", {
        "listings": listings
    })

#categories page
def categories(request):
    categories = Listing.objects.filter(is_active=True).values_list("category", flat=True).distinct()
    return render(request, "auctions/categories.html", {
        "categories": categories
    })

#products in one category
def category(request, name):
    listings = Listing.objects.filter(category=name, is_active=True)
    return render(request, "auctions/category.html", {
        "category": name,
        "listings": listings
    })

#closed listings
def closed_listings(request):
    listings = Listing.objects.filter(is_active=False)
    return render(request, "auctions/closed.html", {
        "listings": listings
    })
