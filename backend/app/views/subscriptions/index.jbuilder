json.array! @subscriptions do |s|
  json.id s.id
  json.watched_all s.watched_all

  json.show do
    json.id s.show.id
    json.title s.show.title
    json.image_url s.show.image_url
    json.in_production s.show.in_production
    json.show_started s.show.show_started
    json.show_ended s.show.show_ended
  end

  if (s.episode)
    json.next_unseen do
      json.index s.episode.episode_index
      json.title s.episode.title
      json.season_number s.episode.season_number
      json.episode_number s.episode.episode_number
      json.aired_at s.episode.aired_at
    end
  else
    json.next_unseen nil
  end

  json.last_aired do
    json.season_number s.show.episodes.aired[-1].season_number
    json.episode_number s.show.episodes.aired[-1].episode_number
  end
end