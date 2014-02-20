require 'open-uri'

API_KEY = 'c6912ebcb61062440ee970a91fe5cdd3'

namespace :themoviedb do
  desc "load new show to the database from xml file"
  task :load, [:id] => :environment do |t, args|
    show_data = JSON.load( open("http://api.themoviedb.org/3/tv/#{args.id}?api_key=#{API_KEY}") )
    @show = Show.create(  :title => show_data["name"],
                          :image_url => "http://image.tmdb.org/t/p/w500/#{show_data['poster_path']}",
                          :show_started => show_data["first_air_date"],
                          :show_ended => show_data["in_production"] ? "still airing" : show_data["last_air_date"] )

    index = 0

    show_data["seasons"].each do |s|
      if s["season_number"] > 0
        season_data = JSON.load( open("http://api.themoviedb.org/3/tv/#{args.id}/season/#{s['season_number']}?api_key=#{API_KEY}") )
        season_data["episodes"].each do |e|
          index += 1
          puts "processing s#{s['season_number']} e#{e['episode_number']}"
          @show.episodes << Episode.create( :title => e["name"],
                                            :episode_number => e["episode_number"],
                                            :season_number => s["season_number"],
                                            :aired_at => e["air_date"],
                                            :episode_index => index)
        end
      end
    end
  end
end