require 'open-uri'

API_KEY = 'c6912ebcb61062440ee970a91fe5cdd3'

namespace :themoviedb do
  desc "load new show to the database from xml file"
  task :load, [] => :environment do |t, args|
    args.extras.each do |show_id|
      if Show.find_by_api_id(show_id).nil?
        puts "-------"
        puts "   loading show #{show_id}"
        show_data = JSON.load( open("http://api.themoviedb.org/3/tv/#{show_id}?api_key=#{API_KEY}") )
        @show = Show.create(  :title => show_data["name"],
                              :api_id => show_id,
                              :in_production => show_data["in_production"],
                              :image_url => "http://image.tmdb.org/t/p/w500/#{show_data['poster_path']}",
                              :show_started => show_data["first_air_date"],
                              :show_ended => show_data["last_air_date"] )

        index = 0

        show_data["seasons"].each do |s|
          if s["season_number"] > 0
            season_data = JSON.load( open("http://api.themoviedb.org/3/tv/#{show_id}/season/#{s['season_number']}?api_key=#{API_KEY}") )
            season_data["episodes"].each do |e|
              puts "adding s#{s['season_number']} e#{e['episode_number']}"
              @show.episodes << Episode.create( :title => e["name"],
                                                :episode_number => e["episode_number"],
                                                :season_number => s["season_number"],
                                                :aired_at => e["air_date"],
                                                :episode_index => index + 1)
              index += 1
            end
          end
        end
      end
    end
  end

  task :update, [] => :environment do |t, args|
    Show.all.each do |show|
      puts "-------"
      puts "   processing show #{show.title}"
      show_data = JSON.load( open("http://api.themoviedb.org/3/tv/#{show.id}?api_key=#{API_KEY}") )
      show.update(  in_production: show_data["in_production"] );

      index = 0

      show_data["seasons"].each_with_index do |s|
        if s["season_number"] > 0
          season_data = JSON.load( open("http://api.themoviedb.org/3/tv/#{show.id}/season/#{s['season_number']}?api_key=#{API_KEY}") )
          season_data["episodes"].each do |e|
            if show.episodes[index]
              puts "updating s#{s['season_number']} e#{e['episode_number']}"
              show.episodes[index].update(  title: e["name"],
                                            episode_number: e["episode_number"],
                                            season_number: s["season_number"],
                                            aired_at: e["air_date"],
                                            episode_index: index + 1 )
            else
              puts "adding s#{s['season_number']} e#{e['episode_number']}"
              show.episodes << Episode.create( title: e["name"],
                                               episode_number: e["episode_number"],
                                               season_number: s["season_number"],
                                               aired_at: e["air_date"],
                                               episode_index: index + 1 )
            end
            index += 1
          end
        end
      end
    end
  end
end