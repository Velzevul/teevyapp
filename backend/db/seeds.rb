# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

shows = Show.create([
  {
    :title => "Firefly",
    :image_url => "//placehold.it/100",
    :show_started => "2010-02-05 21:44:44 +0100",
    :show_ended => "2012-02-05 21:44:44 +0100"
  },
  {
    :title => "Dollhouse",
    :image_url => "//placehold.it/100",
    :show_started => "2010-02-05 21:44:44 +0100",
    :show_ended => "still airing"
  }
])

shows.each do |s|
  s.episodes << Episode.create([
    {
      :episode_index => 1,
      :title => "Ashley",
      :episode_number => 1,
      :season_number => 1,
      :aired_at => 3.days.ago
    },
    {
      :episode_index => 2,
      :title => "Maricela",
      :episode_number => 2,
      :season_number => 1,
      :aired_at => 1.days.ago
    },
    {
      :episode_index => 3,
      :title => "Sallie",
      :episode_number => 3,
      :season_number => 1,
      :aired_at => 3.days.from_now
    }
  ])
end

user  = User.create(
  :login => "Vasa",
  :email => "VasaPupkin@gmail.com",
  :password => "vasapupkin",
  :password_confirmation => "vasapupkin"
)

user.subscriptions.create(
  :show => shows[0],
  :episode => shows[0].episodes[0]
)