class EpisodesController < ApplicationController
  def index
    @episodes = Episode.where(:show_id => params[:show_id])
  end
end
