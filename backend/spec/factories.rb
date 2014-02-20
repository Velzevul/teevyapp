require 'factory_girl'

FactoryGirl.define do
  factory :user do
    sequence("login") { |n| "User #{n}" }
    sequence("email") { |n| "user#{n}@teevy.co" }
    avatar_url "http://api.randomuser.me/0.3/portraits/men/6.jpg"
    password "somepassword"
    password_confirmation "somepassword"

    trait :with_shows do
      ignore do
        shows_count 2
      end

      after (:create) do |user, evaluator|
        FactoryGirl.create_list(:show, evaluator.shows_count, user: user)
      end
    end
  end

  factory :show do
    sequence("title") { |n| "Show #{n}" }
    image_url "http://placehold.it/100"
    sequence("show_started") { |n| 2000 + Random.rand(0..13) }
    sequence("show_ended") { ["still airing", "2011", "2006", "2008"].sample }

    trait :with_episodes do
      ignore do
        episodes_count 10
      end

      after(:create) do |show, evaluator|
        FactoryGirl.create_list(:episode, evaluator.episodes_count, show: show)
      end
    end
  end

  factory :episode do
    ignore do
      seasons_count 8
      ep_per_season 12
    end

    sequence("title") { |n| "Episode #{n}" }
    sequence("episode_number") { |n| (n % ep_per_season) + 1 }
    sequence("season_number") { |n|  (n % seasons_count) + 1 }
    sequence("aired_at") { |n| n.days.ago }

    show

    trait :nonaired do
      sequence("aired_at") { |n| n.days.from_now }
    end
  end
end